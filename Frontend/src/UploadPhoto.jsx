function UploadPhoto() {
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePic", file);

    await fetch("http://localhost:3000/upload-student-photo", {
      method: "POST",
      body: formData
    });

    alert("Photo uploaded");
  };

  return (
    <>
      Upload your photo
      <input
        type="file"
        name="profilePic"
        accept="image/*"
        onChange={handleUpload}
      />
    </>
  );
}

export default UploadPhoto;
