import os
import re
import json

def extract_video_urls_from_directory(directory: str) -> list:
    """
    Quét tất cả các file .txt trong thư mục 'directory' để tìm các URL có phần mở rộng .mp4.
    Trả về danh sách unique các URL.
    """
    video_urls = set()  # Sử dụng set để tránh trùng lặp
    # Biểu thức chính quy để nhận diện các URL có định dạng .mp4
    url_pattern = re.compile(r'https?://[^\s]+?\.mp4\b')
    
    for root, _, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(".txt"):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        # Tìm tất cả các URL .mp4 trong nội dung
                        matches = url_pattern.findall(content)
                        for url in matches:
                            video_urls.add(url)
                except Exception as e:
                    print(f"Error reading file {file_path}: {e}")
    
    return list(video_urls)

def save_video_list_as_json(video_urls: list, output_file: str) -> None:
    """
    Lưu danh sách video URL vào file JSON với cấu trúc:
    [
        { "title": "", "url": "<video URL>", "description": "" },
        ...
    ]
    Nếu file đã tồn tại, sẽ merge với dữ liệu cũ (dựa trên URL làm khóa duy nhất).
    """
    video_entries = []
    for url in video_urls:
        entry = {
            "title": "",         # Tạm để rỗng, bạn có thể cập nhật sau.
            "url": url,
            "description": ""      # Tạm để rỗng, bạn có thể cập nhật sau.
        }
        video_entries.append(entry)
    
    # Nếu file đã tồn tại, merge với dữ liệu cũ để tránh trùng lặp
    if os.path.exists(output_file):
        try:
            with open(output_file, "r", encoding="utf-8") as f:
                existing_entries = json.load(f)
        except Exception as e:
            print(f"Error reading existing JSON file {output_file}: {e}")
            existing_entries = []
    else:
        existing_entries = []
    
    # Merge với dữ liệu cũ dựa trên URL
    merged_dict = {entry["url"]: entry for entry in existing_entries}
    for entry in video_entries:
        merged_dict[entry["url"]] = entry
    merged_entries = list(merged_dict.values())

    try:
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(merged_entries, f, ensure_ascii=False, indent=4)
        print(f"Saved {len(merged_entries)} unique video entries to {output_file}")
    except Exception as e:
        print(f"Error saving video list to JSON: {e}")

def main():
    # Đảm bảo cập nhật đường dẫn đúng vào thư mục chứa file .txt của bạn
    logs_directory = r"C:\Users\84393\Downloads\Coomer\resources\config\logs"
    output_json_file = r"D:\video-list.json"  # Bạn có thể thay đổi đường dẫn lưu theo ý muốn

    video_urls = extract_video_urls_from_directory(logs_directory)
    if not video_urls:
        print("No video URLs found in the specified directory.")
    else:
        save_video_list_as_json(video_urls, output_json_file)

if __name__ == "__main__":
    main()
