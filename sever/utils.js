const axios = require('axios');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dll4acahs',
  api_key: '732389679761917',
  api_secret: process.env.API_SECRET
});

exports.getLatLong = async(postcode, name) => {
  const wantedData = await axios.post('https://geocode.xyz',
    {
      locate: postcode ? postcode : name,
      geoit: 'json',
      region: "SG",
      auth: '399769718692317397568x59003',
      ok: 'Geocode'
    },
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  return wantedData.data
}

exports.uploadToCloudinary = (image) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(image, { public_id: "water_cooler" }, (err, url) => {
      if (err) return reject(err);
      return resolve(url);
    })
  });
}
