fetch('videos/video-list.json')
    .then(response => response.json())
    .then(data => {
        const videoList = document.getElementById('video-list');
        data.forEach(video => {
            const videoItem = document.createElement('div');
            videoItem.className = 'video-item';
            videoItem.innerHTML = `
                <h3><a href="${video.url}" target="_blank">${video.title}</a></h3>
                <p>${video.description}</p>
            `;
            videoList.appendChild(videoItem);
        });
    })
    .catch(error => console.error('Lỗi khi tải danh sách video:', error));
