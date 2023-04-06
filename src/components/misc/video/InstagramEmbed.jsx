const InstagramEmbed = ({link}) => {
  // "https://www.instagram.com/p/<videoID>/embed
  let instagramLink = link + "embed";

  return (
    <iframe
      style={{maxWidth: "100%", paddingBottom: "1.25rem", height: "calc(100vh - 2rem)"}}
      src={instagramLink}
      allowtransparency="true"
      scrolling="no"
      title="video"
    ></iframe>
  );
}

export default InstagramEmbed;