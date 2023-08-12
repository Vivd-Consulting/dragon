export const getRemoteUrl = async s3Key => {
  // This is called out of React context, so we'll need to grab the session token from somewhere else, localstorage is fine
  const token = localStorage.getItem('dragonAccessToken');

  const fetcher = url =>
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.blob())
      .then(blob => URL.createObjectURL(blob));

  const result = await fetcher(`${process.env.NEXT_PUBLIC_API_HOST}/storage/file/${s3Key}`);

  return result;
};

export const defaultCompression = {
  quality: 0.8,
  maxWidth: 1000,
  maxHeight: 1000,
  resize: 'cover'
};
