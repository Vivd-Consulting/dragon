export function ImageConstraints({ width = 512, height = 512 }) {
  return (
    <span>
      The resolution of the image should be at least {width}x{height} pixels.
    </span>
  );
}

export function MissionType() {
  return (
    <>
      <strong>Virtual Tour</strong>: Mission can be played from anywhere - Challenges are available
      right away without the need for GPS or Triggers(no scanning required).
      <br />
      <br />
      <strong>GPS</strong>: Players search outdoors for GPS - based Challenges(like virtual
      geocaching).
      <br />
      Players use the geolocation services in their device to locate the Challenges.
      <br />
      <br />
      <strong>Trigger</strong>: Players use Image Recognition Triggers(triggers can be images, signs
      or other real world objects) or QR Codes that are placed at your Mission.
      <br />
      Triggers can also be provided on - line for learners to play at home.Players must scan the
      triggers in order to unlock the Challenges.
      <br />
      <br />
      <strong>Mixed</strong>: A mixed Mission has both GPS and Trigger - based Challenges.
      <br />
      Mixed Missions are ideal for indoor / outdoor experiences.
      <br />
      <br />
      Check out our{' '}
      <a href="TODO: add link to FAQ" target="_blank" rel="noreferrer">
        FAQ
      </a>{' '}
      for more information!
    </>
  );
}
