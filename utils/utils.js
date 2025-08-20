/**
 * Utility functions for the Kanban application
 */

/**
 * Format a date string into a human-readable format
 * @param {string} dateString - The date string to format
 * @returns {string} - The formatted date string
 */
export function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return "just now";
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  } else if (diffDays < 30) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  } else {
    // For very old dates, fall back to absolute format
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    return `${month}-${day}-${year}`;
  }
}

/**
 * Extract images from a task
 * @param {Object} task - The task object
 * @returns {Array} - Array of image filenames
 */
export function getTaskImages(task) {
  if (!task.image) return [];
  try {
    const images = JSON.parse(task.image);
    return Array.isArray(images) ? images : [];
  } catch (e) {
    return [];
  }
}

/**
 * Create image previews from image filenames
 * @param {Array} images - Array of image filenames
 * @returns {Array} - Array of image preview objects
 */
export function createImagePreviews(images) {
  return images.map((img) => ({
    filename: img,
    url: "uploads/" + img,
  }));
}

/**
 * Validate file size
 * @param {File} file - The file to validate
 * @param {number} maxSize - The maximum file size in bytes
 * @returns {boolean} - Whether the file is valid
 */
export function validateFileSize(file, maxSize = 5 * 1024 * 1024) {
  if (file.size > maxSize) {
    return false;
  }
  return true;
}

/**
 * Create a FormData object for image uploads
 * @param {Array} files - Array of files to upload
 * @returns {FormData} - FormData object with files
 */
export function createImageFormData(files) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images[]", file);
  });
  return formData;
}

/**
 * Create a FormData object for logo upload
 * @param {File} file - The logo file to upload
 * @returns {FormData} - FormData object with logo
 */
export function createLogoFormData(file) {
  const formData = new FormData();
  formData.append("logo", file);
  return formData;
}

/**
 * Get status name from status key
 * @param {string} status - The status key
 * @returns {string} - The status name
 */
export function getStatusName(status) {
  const statusMap = {
    todo: "Backlog",
    progress: "In Progress",
    done: "Done",
  };
  return statusMap[status] || status;
}

/**
 * Filter image files from a DataTransfer object
 * @param {DataTransfer} dataTransfer - The DataTransfer object
 * @returns {Array} - Array of image files
 */
export function filterImageFiles(dataTransfer) {
  return Array.from(dataTransfer.files).filter((file) =>
    file.type.startsWith("image/")
  );
}

/**
 * Extract image files from clipboard data
 * @param {ClipboardEvent} clipboardEvent - The clipboard event
 * @returns {Array} - Array of image files
 */
export function extractImagesFromClipboard(clipboardEvent) {
  const items = clipboardEvent.clipboardData.items;
  const imageFiles = [];

  for (let item of items) {
    if (item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) {
        imageFiles.push(file);
      }
    }
  }

  return imageFiles;
}