/**
 * Premium Image Lightbox & Zoom
 * Strictly targets images within .post-content to avoid affecting thumbnails
 */
document.addEventListener("DOMContentLoaded", () => {
  const postContent = document.querySelector(".post-content");
  if (!postContent) return;

  const images = postContent.querySelectorAll("img:not(.no-lightbox)");

  // Create Overlay Elements
  const overlay = document.createElement("div");
  overlay.className = "lightbox-overlay";

  const closeBtn = document.createElement("button");
  closeBtn.className = "lightbox-close";
  closeBtn.innerHTML = "&times;";

  const imgContainer = document.createElement("div");
  imgContainer.className = "lightbox-img-container";

  const lightboxImg = document.createElement("img");
  lightboxImg.className = "lightbox-img";

  imgContainer.appendChild(lightboxImg);
  overlay.appendChild(closeBtn);
  overlay.appendChild(imgContainer);
  document.body.appendChild(overlay);

  let isZoomed = false;

  // Open Lightbox
  images.forEach((img) => {
    img.style.cursor = "zoom-in";
    img.addEventListener("click", (e) => {
      e.preventDefault();
      lightboxImg.src = img.src;
      overlay.classList.add("active");
      document.body.style.overflow = "hidden"; // Prevent scroll
      resetZoom();
    });
  });

  // Toggle Zoom on Click
  lightboxImg.addEventListener("click", (e) => {
    e.stopPropagation();
    if (isZoomed) {
      resetZoom();
    } else {
      zoomIn(e);
    }
  });

  // Zoom Logic
  function zoomIn(e) {
    isZoomed = true;
    lightboxImg.classList.add("zoomed");
    lightboxImg.style.cursor = "zoom-out";

    // Center zoom on click coordinates
    const rect = imgContainer.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    lightboxImg.style.transformOrigin = `${x * 100}% ${y * 100}%`;
    lightboxImg.style.transform = "scale(2.5)";
  }

  function resetZoom() {
    isZoomed = false;
    lightboxImg.classList.remove("zoomed");
    lightboxImg.style.cursor = "zoom-in";
    lightboxImg.style.transform = "scale(1)";
  }

  // Follow Mouse during Zoom
  imgContainer.addEventListener("mousemove", (e) => {
    if (!isZoomed) return;
    const rect = imgContainer.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    lightboxImg.style.transformOrigin = `${x * 100}% ${y * 100}%`;
  });

  // Close Lightbox
  const closeLightbox = () => {
    overlay.classList.remove("active");
    document.body.style.overflow = "";
    setTimeout(resetZoom, 300);
  };

  closeBtn.addEventListener("click", closeLightbox);
  overlay.addEventListener("click", closeLightbox);

  // Key Support
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("active")) {
      closeLightbox();
    }
  });
});
