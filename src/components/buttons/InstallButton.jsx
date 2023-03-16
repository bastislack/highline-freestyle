import {BsDownload} from "react-icons/bs";
import {useReactPWAInstall} from "react-pwa-install";
import logo from "../../../public/logo96.png";

const InstallButton = () => {
  const {pwaInstall, supported, isInstalled} = useReactPWAInstall();

  const installApp = () => {
    pwaInstall({
      title: "Highline Freestyle",
      logo: logo,
      features: (
        <ul>
          <li>Tricklist</li>
          <li>Combolist</li>
          <li>Random combo generator</li>
          <li>Works offline</li>
        </ul>
      ),
      description: "App for Highline Freestyle athletes",
    })
      .then(
        console.log(
          "App installed successfully or instructions for install shown",
        ),
      )
      .catch(console.log("User cancelled installation"));
  };

  return (
    <>
      {supported() && !isInstalled() && (
        <button className="btn btn-link" onClick={installApp}>
          <BsDownload className="icon-white" />
        </button>
      )}
    </>
  );
};

export default InstallButton;
