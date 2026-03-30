import { Helmet } from "react-helmet-async";

export const SEO = ({ 
  title = "Seekhowithrua - AI & ML Learning Platform",
  description = "Master Data Science, AI, Machine Learning, Full Stack Development, Game Development and Robotics with Seekhowithrua's comprehensive courses and interactive learning platform.",
  keywords = "AI, Machine Learning, Data Science, Full Stack Development, Game Development, Robotics, Python, React, Django, Unity, Online Courses",
  url = "https://app.seekhowithrua.com",
  image = "https://app.seekhowithrua.com/og-image.jpg"
}) => {
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Seekhowithrua" />
      <meta name="robots" content="index, follow" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default SEO;
