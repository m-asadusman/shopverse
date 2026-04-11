
export const cloudinaryConfig = {
  cloudName: "dwcrdqvyr",
  uploadPreset: "ecommerce", 
};

export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", cloudinaryConfig.uploadPreset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  const data = await res.json();

  if (!res.ok) throw new Error(data.error?.message || "Upload failed");

  return data.secure_url; 
};
