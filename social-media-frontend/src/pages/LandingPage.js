import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <div className="upper">
        <div className="header">
          <img className="logo" src="files/logo.png" alt="Sporty Logo" />
          <ul className="nav-links">
            <li><a className="headertext" href="/login">Login</a></li>
            <li><a className="headertext" href="/register">Register</a></li>
          </ul>
        </div>

        <div className="hero">
          <div className="hero-text">
            <div className="herotext">The ultimate sports social media.</div>
            <div className="herosubtext">Receive the best sports information and chat with others.  Join us in the process.</div>
            <Link to="/register">
              <button className="headerbutton">Create new account</button>
            </Link>
          </div>
        </div>
      </div>

      <div className="center">
        <div className="centertext">Find everything about your favorite sports event.</div>
        <div className="centerimages">
          <div className="sport">
            <img src="files/football.jpg" alt="Football" />
            <p>Football</p>
          </div>
          <div className="sport">
            <img src="files/tennis.jpg" alt="Tennis" />
            <p>Tennis</p>
          </div>
          <div className="sport">
            <img src="files/basketball.jpg" alt="Basketball" />
            <p>Basketball</p>
          </div>
          <div className="sport">
            <img src="files/more.jpg" alt="And much more.." />
            <p>And much more..</p>
          </div>
        </div>
      </div>

      <div className="quote">
        <div className="quotetext">“Sport has the power to change the world. It has the power to inspire. It has the power to unite people in a way that little else does. It speaks to youth in a language they understand. Sport can create hope where once there was only despair. It is more powerful than governments in breaking down racial barriers. It laughs in the face of all types of discrimination.”</div>
        <div className="author">- Nelson Mandela</div>
      </div>

      <div className="signup">
        <div className="signuptext">
          <p>Call to action! It's time!</p>
          <p>Sign up by clicking the button right over here!</p>
        </div>
        <Link to="/register">
          <button className="signupbutton">Sign up</button>
        </Link>
      </div>

      <div className="footer">
      Sporty. &copy; 2024
      </div>
    </div>
  );
};

export default LandingPage;
