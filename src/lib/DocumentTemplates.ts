export const TEMPLATE_STYLES = {
  MINIMALIST: 'minimalist',
  MODERN: 'modern',
  PROFESSIONAL: 'professional',
  LINKEDIN: 'linkedin'
};

export const getTemplateHTML = (style: string, data: any) => {
  const baseStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Dancing+Script:wght@700&display=swap');
    * { box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; color: #1c1917; margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; }
    .page { padding: 40px; min-height: 297mm; width: 210mm; margin: 0 auto; position: relative; }
    h1, h2, h3 { margin: 0; line-height: 1.2; }
    p { margin: 0; font-size: 14px; line-height: 1.5; color: #444; }
    ul { margin: 0; padding-left: 18px; }
    li { font-size: 13px; margin-bottom: 4px; color: #444; }
    .icon-text { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #666; }
    .icon { width: 14px; height: 14px; }
  `;

  if (style === TEMPLATE_STYLES.MINIMALIST) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cover Letter - ${data.name}</title>
        <style>
          ${baseStyles}
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 60px; }
          .logo { width: 40px; height: 40px; background: #333; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
          .logo svg { width: 24px; height: 24px; color: white; fill: white; }
          .date { color: #1c1917; font-weight: 700; font-size: 16px; }
          .address { margin-bottom: 40px; }
          .address p { color: #1c1917; font-size: 14px; line-height: 1.6; }
          .subject { font-weight: 700; font-style: italic; margin-bottom: 30px; }
          .body { text-align: justify; }
          .body p { margin-bottom: 20px; font-size: 14px; }
          .signature { margin-top: 60px; }
          .sig-text { font-family: 'Dancing Script', cursive; font-size: 32px; color: #333; margin-bottom: 5px; }
          .footer { position: absolute; bottom: 40px; left: 40px; right: 40px; display: flex; justify-content: space-between; padding-top: 20px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <div class="logo">
              <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <div class="date">23rd January</div>
          </div>
          
          <div class="address">
            <p>123 Anywhere St.,</p>
            <p>Any City,</p>
            <p>ST 12345</p>
          </div>

          <p class="subject">Subject: Job Application</p>
          
          <p>To whom it may concern,</p>
          
          <div class="body">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin dignissim justo in nibh ultrices condimentum.</p>
            <p>Cras urna metus, interdum vel tristique a, porttitor non justo. Fusce gravida dapibus sapien, vestibulum sagittis ante finibus non. Nunc libero justo, ornare et pellentesque et, maximus vitae tellus.</p>
            <p>Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Fusce euismod libero fringilla nunc tincidunt, in volutpat lectus cursus. Nullam suscipit, nulla nec aliquam ullamcorper, tellus orci sagittis nulla, id aliquam risus magna vitae augue. Maecenas vitae vulputate mauris. Duis sed erat cursus, varius enim vel, accumsan eros. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nam rutrum, lacus eu facilisis pellentesque, eros purus rutrum turpis, at sodales eros sapien laoreet elit. Donec egestas mollis sapien.</p>
          </div>

          <div class="signature">
            <p style="margin-bottom: 20px">Kind regards,</p>
            <div class="sig-text">R. Beaundry</div>
            <p style="font-weight: 600">Rachelle Beaudry</p>
          </div>

          <div class="footer">
            <div class="icon-text"><span>📞</span> +123-456-7890</div>
            <div class="icon-text"><span>✉️</span> hello@reallygreatsite.com</div>
            <div class="icon-text"><span>🌐</span> www.reallygreatsite.com</div>
          </div>
        </div>
        <script>window.onload = () => { window.print(); }</script>
      </body>
      </html>
    `;
  }

  if (style === TEMPLATE_STYLES.MODERN) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Resume - ${data.name}</title>
        <style>
          ${baseStyles}
          .header { display: flex; align-items: center; gap: 40px; margin-bottom: 40px; }
          .avatar-container { width: 150px; height: 150px; border-radius: 50%; border: 8px solid white; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; flex-shrink: 0; }
          .avatar-container img { width: 100%; height: 100%; object-cover: cover; }
          .header-info h1 { font-size: 42px; font-weight: 900; color: #1c1917; text-transform: uppercase; letter-spacing: 2px; }
          .header-info p { font-size: 18px; color: #666; margin-top: 5px; letter-spacing: 3px; }
          .contact-grid { display: flex; flex-wrap: wrap; gap: 20px; margin-top: 15px; }
          
          .main-content { display: flex; gap: 40px; }
          .sidebar { width: 220px; flex-shrink: 0; border-right: 1px solid #eee; padding-right: 20px; }
          .content-right { flex: 1; }
          
          .section { margin-bottom: 30px; }
          .section-title { font-size: 18px; font-weight: 800; color: #1c1917; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 15px; border-bottom: 2px solid #1c1917; display: inline-block; padding-bottom: 5px; }
          
          .job-item { margin-bottom: 20px; }
          .job-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px; }
          .job-title { font-weight: 800; color: #1c1917; }
          .job-date { font-size: 12px; font-weight: 700; color: #1c1917; }
          .job-company { font-size: 13px; font-weight: 600; color: #666; margin-bottom: 5px; }
          
          .skill-item { margin-bottom: 8px; display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 500; }
          .dot { width: 6px; height: 6px; background: #1c1917; border-radius: 50%; }
          
          .ref-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; }
          .ref-item p { font-size: 12px; }
          .ref-name { font-weight: 700; margin-bottom: 2px; }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <div class="avatar-container">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop" />
            </div>
            <div class="header-info">
              <h1>Olivia Wilson</h1>
              <p>Graphics Designer</p>
              <div class="contact-grid">
                <div class="icon-text"><span>📞</span> +123-456-7890</div>
                <div class="icon-text"><span>✉️</span> hello@reallygreatsite.com</div>
                <div class="icon-text"><span>🌐</span> www.reallygreatsite.com</div>
              </div>
            </div>
          </div>
          
          <hr style="margin-bottom: 40px; border: 0; border-top: 1px solid #111;" />

          <div class="main-content">
            <div class="sidebar">
              <div class="section">
                <h2 class="section-title">Education</h2>
                <div style="margin-bottom: 15px;">
                  <p style="font-weight: 800; color:#111">Bachelor of Design</p>
                  <p style="font-size: 12px;">Wardiere University</p>
                  <p style="font-size: 11px; font-weight: 600; color:#666">2006 - 2008</p>
                </div>
                <div style="margin-bottom: 15px;">
                  <p style="font-weight: 800; color:#111">Bachelor of Design</p>
                  <p style="font-size: 12px;">Wardiere University</p>
                  <p style="font-size: 11px; font-weight: 600; color:#666">2006 - 2008</p>
                </div>
              </div>
              
              <div class="section">
                <h2 class="section-title">Expertise</h2>
                <div class="skill-item"><div class="dot"></div> Management Skills</div>
                <div class="skill-item"><div class="dot"></div> Digital Marketing</div>
                <div class="skill-item"><div class="dot"></div> Negotiation</div>
                <div class="skill-item"><div class="dot"></div> Critical Thinking</div>
                <div class="skill-item"><div class="dot"></div> Communication Skills</div>
              </div>

              <div class="section">
                <h2 class="section-title">Language</h2>
                <div class="skill-item"><div class="dot"></div> English</div>
                <div class="skill-item"><div class="dot"></div> Spanish</div>
                <div class="skill-item"><div class="dot"></div> French</div>
              </div>
            </div>
            
            <div class="content-right">
              <div class="section">
                <h2 class="section-title">Profile</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
              </div>
              
              <div class="section">
                <h2 class="section-title">Work Experience</h2>
                <div class="job-item">
                  <div class="job-header">
                    <span class="job-title">Ginyard International Co.</span>
                    <span class="job-date">2020 - 2023</span>
                  </div>
                  <p class="job-company">Product Design Manager</p>
                  <ul>
                    <li>Working with the wider development team.</li>
                    <li>Manage website design, content, and SEO Marketing, Branding and Logo Design</li>
                  </ul>
                </div>
                
                <div class="job-item">
                  <div class="job-header">
                    <span class="job-title">Arowwai Industries</span>
                    <span class="job-date">2019 - 2020</span>
                  </div>
                  <p class="job-company">Product Design Manager</p>
                  <ul>
                    <li>Working with the wider development team.</li>
                    <li>Manage website design, content, and SEO Marketing, Branding and Logo Design</li>
                  </ul>
                </div>

                <div class="job-item">
                  <div class="job-header">
                    <span class="job-title">Ginyard International Co.</span>
                    <span class="job-date">2017 - 2019</span>
                  </div>
                  <p class="job-company">Product Design Manager</p>
                  <ul>
                    <li>Working with the wider development team.</li>
                    <li>Manage website design, content, and SEO Marketing, Branding and Logo Design</li>
                  </ul>
                </div>
              </div>

              <div class="section">
                <h2 class="section-title">References</h2>
                <div class="ref-grid">
                  <div class="ref-item">
                    <p class="ref-name">Bailey Dupont</p>
                    <p>Wardiere Inc. / CEO</p>
                    <p>Phone: 123-456-7890</p>
                    <p>Email: hello@reallygreatsite.com</p>
                  </div>
                  <div class="ref-item">
                    <p class="ref-name">Harumi Kobayashi</p>
                    <p>Wardiere Inc. / CEO</p>
                    <p>Phone: 123-456-7890</p>
                    <p>Email: hello@reallygreatsite.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <script>window.onload = () => { window.print(); }</script>
      </body>
      </html>
    `;
  }

  if (style === TEMPLATE_STYLES.PROFESSIONAL) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Professional CV - ${data.name}</title>
        <style>
          ${baseStyles}
          .page { padding: 50px 60px; }
          .header { border-bottom: 2px solid #1c1917; padding-bottom: 30px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
          .header-left h1 { font-size: 48px; font-weight: 900; color: #1c1917; text-transform: uppercase; letter-spacing: -1px; line-height: 1; }
          .header-left p { font-size: 18px; color: #555; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; margin-top: 10px; }
          .header-right { text-align: right; }
          
          .content-grid { display: grid; grid-template-cols: 1fr 2fr; gap: 60px; }
          .section { margin-bottom: 40px; }
          .section-title { font-size: 14px; font-weight: 900; color: #1c1917; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; display: flex; align-items: center; gap: 15px; }
          .section-title::after { content: ''; flex: 1; height: 1px; background: #eee; }
          
          .job-item { margin-bottom: 30px; position: relative; }
          .job-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .job-role { font-size: 16px; font-weight: 800; color: #1c1917; }
          .job-date { font-size: 13px; font-weight: 700; color: #666; }
          .job-company { font-size: 14px; font-weight: 600; color: #1c1917; margin-bottom: 10px; display: block; }
          
          .skill-badge { display: inline-block; padding: 4px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; font-weight: 600; margin-right: 8px; margin-bottom: 8px; color: #444; }
          .education-item { margin-bottom: 20px; }
          .edu-degree { font-weight: 800; color: #1c1917; font-size: 14px; }
          .edu-school { font-size: 13px; color: #666; font-weight: 500; }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <div class="header-left">
              <h1>${data.name}</h1>
              <p>Senior Program Manager</p>
            </div>
            <div class="header-right">
              <div class="icon-text" style="justify-content: flex-end; margin-bottom: 5px;">hello@reallygreatsite.com <span>✉️</span></div>
              <div class="icon-text" style="justify-content: flex-end; margin-bottom: 5px;">+123-456-7890 <span>📞</span></div>
              <div class="icon-text" style="justify-content: flex-end;">London, United Kingdom <span>📍</span></div>
            </div>
          </div>

          <div class="content-grid">
            <div class="sidebar">
              <div class="section">
                <h2 class="section-title">Education</h2>
                <div class="education-item">
                  <p class="edu-degree">MSc in Business Admin</p>
                  <p class="edu-school">University of Chicago</p>
                  <p class="job-date">2014 - 2016</p>
                </div>
                <div class="education-item">
                  <p class="edu-degree">BSc in Economics</p>
                  <p class="edu-school">LSE University</p>
                  <p class="job-date">2010 - 2014</p>
                </div>
              </div>

              <div class="section">
                <h2 class="section-title">Core Skills</h2>
                <div class="skill-badge">Strategic Planning</div>
                <div class="skill-badge">Financial Analysis</div>
                <div class="skill-badge">Team Leadership</div>
                <div class="skill-badge">Risk Management</div>
                <div class="skill-badge">Agile Delivery</div>
                <div class="skill-badge">Product Strategy</div>
              </div>

              <div class="section">
                <h2 class="section-title">Languages</h2>
                <p style="font-weight: 700; margin-bottom: 5px;">English <span style="font-weight: 400; color: #888;">(Native)</span></p>
                <p style="font-weight: 700; margin-bottom: 5px;">German <span style="font-weight: 400; color: #888;">(Professional)</span></p>
                <p style="font-weight: 700;">French <span style="font-weight: 400; color: #888;">(Elementary)</span></p>
              </div>
            </div>

            <div class="main">
              <div class="section">
                <h2 class="section-title">Professional Profile</h2>
                <p>Highly accomplished Senior Program Manager with over 10 years of experience in delivering multi-million dollar digital transformation projects. Proven track record of optimizing operational efficiencies and leading cross-functional teams to exceed corporate objectives in fast-paced global environments.</p>
              </div>

              <div class="section">
                <h2 class="section-title">Experience</h2>
                <div class="job-item">
                  <div class="job-header">
                    <span class="job-role">Global Operations Director</span>
                    <span class="job-date">2020 - Present</span>
                  </div>
                  <span class="job-company">FinTech Solutions Inc.</span>
                  <ul>
                    <li>Directed global operations team across 5 regions, improving service delivery by 34%.</li>
                    <li>Implemented new ERP system saving $1.2M in annual operational costs.</li>
                    <li>Managed stakeholder relations at Board level for all major technology pivots.</li>
                  </ul>
                </div>

                <div class="job-item">
                  <div class="job-header">
                    <span class="job-role">Senior Project Manager</span>
                    <span class="job-date">2016 - 2020</span>
                  </div>
                  <span class="job-company">NextGen Tech Group</span>
                  <ul>
                    <li>Led the development of a flagship SaaS platform from ideation to $10M ARR.</li>
                    <li>Spearheaded international expansion into EMEA markets, securing 50+ enterprise clients.</li>
                    <li>Established project management center of excellence (CoE) for 200+ employees.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <script>window.onload = () => { window.print(); }</script>
      </body>
      </html>
    `;
  }

  if (style === TEMPLATE_STYLES.LINKEDIN) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>LinkedIn Success Profile - ${data.name}</title>
        <style>
          ${baseStyles}
          .page { padding: 0; background: #f3f2ef; }
          .header-banner { height: 160px; background: linear-gradient(to right, #0a66c2, #004182); }
          .profile-card { margin: -60px 40px 20px 40px; background: white; border-radius: 8px; border: 1px solid #e0e0e0; padding: 24px; position: relative; }
          .profile-pic { width: 152px; height: 152px; border-radius: 50%; border: 4px solid white; box-shadow: 0 0 0 1px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 16px; background: #fff; }
          .profile-pic img { width: 100%; height: 100%; object-fit: cover; }
          
          .name-info h1 { font-size: 24px; font-weight: 600; color: rgba(0,0,0,0.9); margin-bottom: 4px; }
          .headline { font-size: 16px; color: rgba(0,0,0,0.9); margin-bottom: 8px; }
          .sub-info { font-size: 14px; color: rgba(0,0,0,0.6); display: flex; gap: 8px; align-items: center; }
          .dot { width: 3px; height: 3px; background: rgba(0,0,0,0.6); border-radius: 50%; }
          
          .connection-count { margin-top: 12px; font-size: 14px; font-weight: 600; color: #0a66c2; }
          
          .section { margin: 20px 40px; background: white; border-radius: 8px; border: 1px solid #e0e0e0; padding: 24px; }
          .section-header { font-size: 20px; font-weight: 600; color: rgba(0,0,0,0.9); margin-bottom: 16px; }
          
          .about-text { font-size: 14px; color: rgba(0,0,0,0.9); line-height: 1.5; white-space: pre-line; }
          
          .exp-item { display: flex; gap: 12px; margin-bottom: 24px; border-bottom: 1px solid #eee; padding-bottom: 24px; }
          .exp-item:last-child { border-bottom: 0; margin-bottom: 0; padding-bottom: 0; }
          .company-logo { width: 48px; height: 48px; background: #eee; border-radius: 4px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #999; }
          .exp-details h3 { font-size: 16px; font-weight: 600; color: rgba(0,0,0,0.9); }
          .exp-company { font-size: 14px; color: rgba(0,0,0,0.9); margin: 2px 0; }
          .exp-date { font-size: 14px; color: rgba(0,0,0,0.6); margin-bottom: 8px; }
          .exp-desc { font-size: 14px; color: rgba(0,0,0,0.9); }
          
          .skill-item { padding: 16px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
          .skill-item:last-child { border-bottom: 0; }
          .skill-name { font-size: 16px; font-weight: 600; color: rgba(0,0,0,0.9); }
          .endorsement { font-size: 14px; color: rgba(0,0,0,0.6); }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header-banner"></div>
          <div class="profile-card">
            <div class="profile-pic">
              <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&h=200&auto=format&fit=crop" />
            </div>
            <div class="name-info">
              <h1>${data.name}</h1>
              <p class="headline">Strategy Consultant at Global Peak Partners | Digital Transformation Expert | MBA</p>
              <div class="sub-info">
                 New York City Metropolitan Area <div class="dot"></div> <span style="color: #0a66c2; font-weight: 600;">Contact info</span>
              </div>
              <p class="connection-count">500+ connections</p>
            </div>
          </div>

          <div class="section">
            <h2 class="section-header">About</h2>
            <div class="about-text">
              Results-driven Strategy Consultant with a decade of experience in navigating complex digital landscapes for Fortune 500 companies. 

              Specializing in cross-functional team leadership, market entry strategies, and operational excellence. Passionate about leveraging emerging technologies to drive sustainable growth and enhance customer experiences.

              Let's connect to discuss the future of digital ecosystems and organizational resilience.
            </div>
          </div>

          <div class="section">
            <h2 class="section-header">Experience</h2>
            <div class="exp-item">
              <div class="company-logo">GPP</div>
              <div class="exp-details">
                <h3>Senior Strategy Consultant</h3>
                <p class="exp-company">Global Peak Partners · Full-time</p>
                <p class="exp-date">Jan 2021 - Present · 3 yrs 2 mos</p>
                <div class="exp-desc">Leading digital portfolio optimization for retail banking clients. Achieved 22% reduction in customer churn through predictive analytics implementation.</div>
              </div>
            </div>
            <div class="exp-item">
              <div class="company-logo">BTG</div>
              <div class="exp-details">
                <h3>Management Consultant</h3>
                <p class="exp-company">Blue Tier Group · Full-time</p>
                <p class="exp-date">Jun 2017 - Dec 2020 · 3 yrs 7 mos</p>
                <div class="exp-desc">Led workstreams in post-merger integration for a $4B pharmaceutical acquisition. Managed synergy capture tracking resulting in $150M savings over 18 months.</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2 class="section-header">Skills</h2>
            <div class="skill-item">
              <span class="skill-name">Digital Transformation</span>
              <span class="endorsement">42 endorsements</span>
            </div>
            <div class="skill-item">
              <span class="skill-name">Strategic Planning</span>
              <span class="endorsement">38 endorsements</span>
            </div>
            <div class="skill-item">
              <span class="skill-name">Stakeholder Management</span>
              <span class="endorsement">31 endorsements</span>
            </div>
          </div>
        </div>
        <script>window.onload = () => { window.print(); }</script>
      </body>
      </html>
    `;
  }

  return '';
};
