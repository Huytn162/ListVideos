let videoList = [];
let currentIndex = 0;
const videoFeed = document.getElementById('videoFeed');
const loading = document.getElementById('loading');
const videoSection = document.getElementById('videoSection');
const categoryContainer = document.getElementById('categoryContainer');

// Hàm tạo phần tử hiển thị danh mục
function createCategoryItem(categoryData) {
  const div = document.createElement("div");
  div.className = "category";
  div.innerHTML = `
    <img src="${categoryData.thumbnail}" alt="${categoryData.name}">
    <p>${categoryData.name}</p>
  `;
  div.onclick = () => loadCategory(categoryData.name);
  return div;
}

// Load danh mục từ file categories.json nằm trong static/videos
function loadCategories() {
  fetch("static/videos/categories.json")
    .then(response => response.json())
    .then(categories => {
      categoryContainer.innerHTML = "";
      categories.forEach(cat => {
        const categoryItem = createCategoryItem(cat);
        categoryContainer.appendChild(categoryItem);
      });
    })
    .catch(error => {
      console.error("Error loading categories:", error);
      categoryContainer.innerHTML = "<p>Lỗi tải danh mục</p>";
    });
}

// Hàm tạo phần tử video từ dữ liệu video
function createVideoItem(videoData) {
  const container = document.createElement('div');
  container.className = 'video-item';
  
  const videoEl = document.createElement('video');
  videoEl.src = videoData.url;
  videoEl.poster = videoData.thumb || ""; // Nếu bạn có thuộc tính thumb
  videoEl.muted = true;
  videoEl.loop = true;
  videoEl.playsInline = true;
  videoEl.preload = "metadata";
  videoEl.controls = true;
  
  const titleEl = document.createElement("div");
  titleEl.className = "video-title";
  titleEl.innerText = videoData.title || "";
  
  container.appendChild(videoEl);
  container.appendChild(titleEl);
  return container;
}

// Load danh sách video thuộc danh mục được chọn
function loadCategory(category) {
  loading.style.display = "block";
  fetch(`static/videos/${category}.json`)
    .then(response => response.json())
    .then(data => {
      videoList = data;
      currentIndex = 0;
      renderVideos();
      loading.style.display = "none";
      videoSection.style.display = "block";
      // Cuộn đến video đầu tiên nếu có
      scrollToVideo(0);
    })
    .catch(error => {
      console.error("Lỗi khi tải video:", error);
      loading.innerText = "Lỗi tải danh sách video";
    });
}

// Render video feed
function renderVideos() {
  videoFeed.innerHTML = "";
  videoList.forEach(videoData => {
    const videoItem = createVideoItem(videoData);
    videoFeed.appendChild(videoItem);
  });
  // Áp dụng IntersectionObserver để tự động phát/tạm dừng video khi cuộn
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target.querySelector('video');
      if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
        video.play().catch(err => console.error(err));
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.7 });
  
  document.querySelectorAll('.video-item').forEach(item => observer.observe(item));
}

// Cuộn đến video theo chỉ số
function scrollToVideo(index) {
  const videoItems = document.querySelectorAll('.video-item');
  if (index >= 0 && index < videoItems.length) {
    videoItems[index].scrollIntoView({ behavior: 'smooth' });
    currentIndex = index;
  }
}

function nextVideo() {
  const videoItems = document.querySelectorAll('.video-item');
  if (currentIndex < videoItems.length - 1) {
    scrollToVideo(currentIndex + 1);
  }
}

function prevVideo() {
  if (currentIndex > 0) {
    scrollToVideo(currentIndex - 1);
  }
}

// Khi trang load, tải danh mục
window.onload = function() {
  loadCategories();
};
