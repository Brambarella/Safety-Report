import React from 'react';
import '../styles/modal.css';

function ContactAdminModal({ onClose }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card">

        <div className="modal-header">
          <div className="modal-title">
            🛡️ Account Registration
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <p className="modal-desc">
          Untuk membuat akun baru, silakan hubungi administrator.
        </p>

        <div className="modal-section">
          <h4>Contact Information</h4>

          <div className="contact-item">
            📧 admin@safetyreport.id
          </div>
          <div className="contact-item">
            📞 +62 21 1234 5678
          </div>
          <div className="contact-item">
            💬 WhatsApp: +62 812 3456 7890
          </div>
        </div>

        <div className="modal-note">
          ℹ️ Harap siapkan data perusahaan dan dokumen K3 saat menghubungi admin.
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <a
            href="mailto:admin@safetyreport.id"
            className="btn-primary"
          >
            ✉️ Send Email
          </a>
        </div>

      </div>
    </div>
  );
}

export default ContactAdminModal;
