let videoList = [];
let currentIndex = 0;
let currentCategory = null; // Danh mục hiện đang mở
const videoFeed = document.getElementById('videoFeed');
const loading = document.getElementById('loading');
const videoSection = document.getElementById('videoSection');
const categoryContainer = document.getElementById('categoryContainer');

// Hàm load danh mục từ file categories.json nằm trong static/videos
function loadCategories() {
  fetch("static/videos/categories.json")
    .then(response => response.json())
    .then(categories => {
      categoryContainer.innerHTML = "";
      categories.forEach(cat => {
        const div = document.createElement("div");
        div.className = "category";
        div.innerHTML = `<img src="${cat.thumbnail}" alt="${cat.name}">
                         <p>${cat.name}</p>`;
        div.onclick = () => loadCategory(cat.name);
        categoryContainer.appendChild(div);
      });
    })
    .catch(error => {
      console.error("Error loading categories:", error);
      categoryContainer.innerHTML = "<p>Lỗi tải danh mục</p>";
    });
}

// Tạo phần tử video từ dữ liệu của một video
function createVideoItem(videoData) {
  const container = document.createElement('div');
  container.className = 'video-item';
  
  const videoEl = document.createElement('video');
  videoEl.src = videoData.url;
  videoEl.muted = true;        // Autoplay yêu cầu video phải muted
  videoEl.loop = true;
  videoEl.playsInline = true;
  videoEl.preload = "metadata";
  videoEl.controls = true;      // Hiển thị thanh điều khiển nếu cần
  
  const titleEl = document.createElement("div");
  titleEl.className = "video-title";
  titleEl.textContent = videoData.title || "";
  
  container.appendChild(videoEl);
  container.appendChild(titleEl);
  return container;
}

// Render danh sách video vào phần video feed
function renderVideos() {
  videoFeed.innerHTML = "";
  videoList.forEach(videoData => {
    const videoItem = createVideoItem(videoData);
    videoFeed.appendChild(videoItem);
  });
  
  // Sử dụng IntersectionObserver để tự động phát/tạm dừng video khi cuộn
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

// Hàm load danh mục video theo toggle:
// Nếu danh mục hiện đang mở đang được click lại, ẩn danh sách video (đóng mục)
function loadCategory(category) {
  if (currentCategory === category && videoSection.style.display === "block") {
    videoSection.style.display = "none";
    currentCategory = null;
    return;
  }
  currentCategory = category;
  loading.style.display = "block";
  fetch(`static/videos/${category}.json`)
    .then(response => response.json())
    .then(data => {
      videoList = data;
      currentIndex = 0;
      renderVideos();
      loading.style.display = "none";
      videoSection.style.display = "block";
      scrollToVideo(0);
    })
    .catch(error => {
      console.error("Lỗi khi tải video:", error);
      loading.textContent = "Lỗi tải danh sách video";
    });
}

// Khi trang load, load danh mục
window.onload = function() {
  loadCategories();
};
