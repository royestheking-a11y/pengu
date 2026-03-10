import React from 'react';
import { Helmet } from 'react-helmet-async';
import { getSiteUrl } from '../../config';

const SocialSchema = () => {
    const siteUrl = getSiteUrl();
    // This JSON object tells Google exactly who you are and where your socials live
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Pengu",
        "url": siteUrl,
        "logo": `${siteUrl}/logo.png`, // Update with your actual logo URL
        "description": "A premium academic operating system and career accelerator for students, graduates, and professionals.",
        "sameAs": [
            "https://www.instagram.com/project.pengu/",
            "https://www.facebook.com/penguproject",
            "https://www.threads.net/@project.pengu"
        ]
    };

    return (
        <Helmet>
            {/* Injecting the Schema into the DOM */}
            <script type="application/ld+json">
                {JSON.stringify(organizationSchema)}
            </script>
        </Helmet>
    );
};

export default SocialSchema;
