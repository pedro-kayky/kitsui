import React from 'react';
import { Link } from 'react-router-dom';
import PublicPage from './publicpage';

export default function Contact() {
  return (
    <PublicPage
      title="Contact Kitsui"
      description="Get in touch with Kitsui: questions, bug reports, translation errors, feedback and privacy requests."
    >
      <p>
        We would like to hear from you. Whether you found a mistake in a translation, a bug in the
        app or you have an idea to make Kitsui better, send us an email and we will read it.
      </p>

      <h2>Email</h2>
      <p>
        <a href="mailto:kitsui547@gmail.com">kitsui547@gmail.com</a>
      </p>
      <p>We read every message and reply as soon as we can.</p>

      <h2>What you can write to us about</h2>
      <ul>
        <li>
          <strong>Translation errors.</strong> Tell us the word, the languages and what was wrong,
          so we can improve the results.
        </li>
        <li>
          <strong>Bugs and problems.</strong> Describe what you did, what you expected and what
          happened instead. The device and browser you use also help.
        </li>
        <li>
          <strong>Ideas and feedback.</strong> New languages, new features or anything that would
          make your study easier.
        </li>
        <li>
          <strong>Account and privacy requests.</strong> If you want your account or your data
          deleted, write to us from the email address of your Google account. You can also read
          our <a href="/privacy.html">Privacy Policy</a>.
        </li>
      </ul>

      <h2>Before you write</h2>
      <p>
        Many common questions are answered on the <Link to="/about">About page</Link> and in the
        FAQ on the <Link to="/">home page</Link>. Please do not send passwords or other sensitive
        information by email. Kitsui never asks for your Google password.
      </p>
    </PublicPage>
  );
}