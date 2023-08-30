import express from "express";
import { v4 } from "uuid";
import { HeadObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";

import { s3Client } from './aws.js';
import knex from "./db.js";

const { S3_BUCKET } = process.env;

const router = express.Router();

const jwtClaim = "https://hasura.io/jwt/claims";

/*
const uploadMulter = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: S3_BUCKET,
    metadata: (req, file, cb) => {
      cb(null, {
        originalname: file.originalname,
      });
    },
    contentType: function (req, file, cb) {
      cb(null, file.mimetype);
    },
    key: function (req, file, cb) {
      // generate unique file names to be saved on the server
      const uuid = v4();
      const key = uuid;

      req.saved_files.push({
        originalname: file.originalname,
        mimetype: file.mimetype,
        encoding: file.encoding,
        key,
      });

      cb(null, key);
    },
  }),
});
*/

const upload_auth = (req, res, next) => {
  // all uploaded files gets pushed in to this array
  // this array is returned back to the client once all uploads are
  // completed

  req.saved_files = [];
  next();
};

/*
router.post(
  "/upload",
  upload_auth,
  uploadMulter.array("files", 50),
  async function (req, res, next) {
    try {
      const type = req.headers["type"] || "image";
      // const claims = res.locals.token[jwtClaim]

      const media = await persistMedia(req.saved_files, type);

      res.json(media);
    } catch (error) {
      next(error);
    }
  }
);
*/

// Update our Media table in the database
async function persistMedia(files, type, organization) {
  const transaction = await knex.transaction();
  const [ids] = await Promise.all(
    files.map(async ({ key, originalname, mimetype }) => {
      const [attribution] = await knex("attribution")
        .insert({}, ["id"])
        .transacting(transaction);

      return await knex("media")
        .insert(
          {
            key,
            filename: originalname,
            mimetype,
            type,
            attribution_id: attribution.id,
            organization_id: organization,
          },
          ["id", "key"]
        )
        .transacting(transaction);
    })
  );

  await transaction.commit();

  return ids;
}

router.get("/file/*", async (req, res, next) => {
  const Key = `${req.params[0]}`;
  const params = {
    Bucket: S3_BUCKET,
    Key,
  };

  try {
    const head = await s3Client.send(new HeadObjectCommand(params));

    //Add the content type to the response ( it's not propagated from the S3 SDK)
    res.set("Content-Type", head.ContentType);
    res.set("Content-Length", head.ContentLength);
    res.set("Last-Modified", head.LastModified);
    res.set(
      "Content-Disposition",
      `inline; filename="${head.Metadata.originalname}"`
    );
    res.set("ETag", head.ETag);

    const object = await s3Client.send(new GetObjectCommand(params));

    return object.Body.pipe(res);
  } catch (e) {
    next(e);
  }
});

export default router;
