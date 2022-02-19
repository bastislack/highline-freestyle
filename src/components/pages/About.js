import Modal from 'react-bootstrap/Modal';
import { Trans } from '@lingui/macro'

const About = ({ showAboutPage, setShowAboutPage }) => {

  return (
    <Modal show={showAboutPage} onHide={() => setShowAboutPage(false)}>
      <Modal.Header closeButton>
        <Modal.Title><Trans id="aboutPage.title">About highline-freestyle.com</Trans></Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5><Trans id="aboutPage.goalTitle">What is the goal of this app?</Trans></h5>
        <p>
          <Trans id="aboutPage.goalDescription">
            This app is made by passionate highline freestyle athletes that want to see the sport grow.
            As more and more tricks are created every week it is hard to keep the overview.
            Here we want to show you the most common tricks/combos along with important information to help you learn them.
            Setting the stick frequency on your tricks/combos allows you to have a visual overview of your arsenal.
            The feature that was the initial motivation for making this app is the random combo generator.
            It should help you trying out new combos that you otherwise wouldn't have tried.
            We want both beginners and advanced athletes to benefit from using this app.
          </Trans>
        </p>
        <h5>
          <Trans id="aboutPage.nextFeaturesTitle">What are the next features we are working on?</Trans></h5>
          <Trans id="aboutPage.nextFeaturesDescription">
            <ul>
              <li>A Combo Builder will be added, so you can create your own combos.</li>
              <li>We will provide the Frontrange Freestyler and BouncKult athlete's favorite combos.</li>
              <li>New features and improvements on the Combo Generator.</li>
            </ul>
        </Trans>
        <h5><Trans id="aboutPage.contributeTitle">How can you contribute?</Trans></h5>
        <p>
          <Trans id="aboutPage.contributeDescription">
            If you want to have a specific feature or a bug fix in the future versions of this app please write us via Facebook or Instagram.
            If you are a developer yourself then don't hesitate to get involved in our repository:
            <br/>
            <a href="https://github.com/bastislack/highline-freestyle">Github repository</a>
          </Trans>
        </p>
        <h5><Trans id="aboutPage.dataHandlingTitle">How is your data handled?</Trans></h5>
        <p>
          <Trans id="aboutPage.dataHandlingDescription">
            As we are highliners we want to make this app work offline.
            Thus all your data is stored locally in your browser.
            We use the <a href="https://en.wikipedia.org/wiki/Web_storage">localstorage</a> and <a href="https://en.wikipedia.org/wiki/Indexed_Database_API">indexedDB</a> API to save your data in your browser.
            We will never know about your data, only your browser knows about it!
          </Trans>
        </p>
      </Modal.Body>
    </Modal>
  );
}

export default About;
