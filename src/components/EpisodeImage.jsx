import React, { useState } from "react";
import { motion } from "framer-motion";

const EpisodeImage = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={`${className} relative bg-black bg-opacity-30 overflow-hidden`}
    >
      <motion.img
        key={src}
        src={src}
        alt={alt}
        className="w-full h-full object-cover absolute top-0 left-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
};

export default EpisodeImage;
