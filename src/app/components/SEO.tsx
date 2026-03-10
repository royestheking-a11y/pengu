import React from 'react';
import { Helmet } from 'react-helmet-async';
import { getSiteUrl } from '../../config';

interface SEOProps {
    title: string;
    description: string;
    keywords?: string;
    url?: string;
    type?: 'website' | 'article';
}

const SEO: React.FC<SEOProps> = ({
    title,
    description,
    keywords = "academic support, career accelerator, student workspace, professional formatting, resume optimization, Pengu",
    url,
    type = 'website'
}) => {
    const siteName = "Pengu";
    const fullTitle = `${title} | ${siteName}`;
    const siteUrl = getSiteUrl();
    const finalUrl = url ? (url.startsWith('http') ? url : `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`) : siteUrl;

    return (
        <Helmet>
            {/* Standard SEO Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <link rel="canonical" href={finalUrl} />

            {/* OpenGraph / Facebook / LinkedIn Tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={finalUrl} />
            <meta property="og:site_name" content={siteName} />

            {/* Twitter Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
        </Helmet>
    );
};

export default SEO;
