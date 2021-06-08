import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Github } from 'react-bootstrap-icons';
import EnvVars from './EnvVars';

const TopNav = (props) => (
  <Navbar bg="light" expand="lg">
    <Navbar.Brand>WFH Stress Monitor</Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="mr-auto">
        <Nav.Link href="http://github.com/bsatrom/wfh_stress_detector"><Github /></Nav.Link>
        <Nav.Link href="https://blues.io">Blues.io</Nav.Link>
        <EnvVars
          notify_hr={props.envVars.notify_hr}
          sound_max={props.envVars.sound_max}
          notify_batt={props.envVars.notify_batt}
        />
      </Nav>
      <Form inline>
        <Button variant="outline-primary">Log In</Button>
      </Form>
    </Navbar.Collapse>
  </Navbar>
);

export default TopNav;