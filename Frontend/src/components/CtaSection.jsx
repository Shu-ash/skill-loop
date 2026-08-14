// src/components/CtaSection.jsx
import { Link } from 'react-router-dom';

export default function CtaSection() {
  return (
    /* Section content */
    <section className="cta-section">
      {/* Call to action box */}
      <div className="glass-panel cta-box">
        <h2>Your first swap is one click away.</h2>
        <p>Bring one skill. Leave with a new one.</p>

        {/* Profile Creation Button */}
        <Link className="btn btn-primary" to="/login">
          Create your profile &rarr;
        </Link>
      </div>
    </section>
  );
}