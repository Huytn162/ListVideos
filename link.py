import os
import re
import json
import requests

def check_url(url: str) -> bool:
    """
    Gửi yêu cầu HEAD đến URL với timeout ngắn.
    Nếu nhận được phản hồi HTTP 200, trả về True.
    """
    try:
        resp = requests.head(url, timeout=5)
        return resp.status_code == 200
    except Exception:
        return False

def validate_and_transform_url(url: str) -> str:
    """
    Nếu URL bắt đầu bằng "https://coomer.su/", 
    lấy phần còn lại của URL và thử các candidate từ n1 đến n10 với định dạng:
       https://n{i}.coomer.su/data/<remainder>
    Trả về candidate đầu tiên hoạt động (HEAD request thành công).
    Nếu không tìm được candidate nào, trả về None.
    
    Nếu URL không bắt đầu bằng "https://coomer.su/", chỉ kiểm tra và trả về URL đó nếu hoạt động.
    """
    if url.startswith("https://coomer.su/"):
        remainder = url[len("https://coomer.su/"):]
        for i in range(1, 11):
            candidate = f"https://n{i}.coomer.su/data/{remainder}"
            if check_url(candidate):
                return candidate
        return None
    else:
        return url if check_url(url) else None

def extract_video_urls_from_directory(directory: str) -> list:
    """
    Quét tất cả các file .txt trong thư mục 'directory' để tìm các URL có đuôi .mp4.
    Nếu mỗi dòng có định dạng: <video URL>,<label>, chỉ lấy phần trước dấu phẩy.
    Sau đó, kiểm tra và chuyển đổi (nếu cần) thông qua validate_and_transform_url.
    Trả về danh sách unique các URL hợp lệ.
    """
    video_urls = set()  # Dùng set tránh trùng lặp
    # Regex để nhận diện các URL có định dạng .mp4 (dừng ngay khi gặp dấu phẩy)
    url_pattern = re.compile(r'(https?://[^\s,]+\.mp4)', re.IGNORECASE)
    
    for root, _, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(".txt"):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        for line in f:
                            line = line.strip()
                            if not line:
                                continue
                            match = url_pattern.search(line)
                            if match:
                                original_url = match.group(1)
                                valid_url = validate_and_transform_url(original_url)
                                if valid_url:
                                    video_urls.add(valid_url)
                                else:
                                    print(f"Link không hoạt động hoặc không tìm được candidate phù hợp: {original_url}")
                except Exception as e:
                    print(f"Error reading file {file_path}: {e}")
    
    return list(video_urls)

def save_video_list_as_json(video_urls: list, output_file: str) -> None:
    """
    Lưu danh sách video URL vào file JSON theo cấu trúc:
    [
       { "title": "", "url": "<video URL>", "description": "" },
       ...
    ]
    Nếu file đã tồn tại, merge với dữ liệu cũ dựa trên URL làm khóa duy nhất.
    """
    video_entries = [{"title": "", "url": url, "description": ""} for url in video_urls]
    
    if os.path.exists(output_file):
        try:
            with open(output_file, "r", encoding="utf-8") as f:
                existing_entries = json.load(f)
        except Exception as e:
            print(f"Error reading existing JSON file {output_file}: {e}")
            existing_entries = []
    else:
        existing_entries = []
    
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
    # Đường dẫn tới thư mục chứa các file log .txt
    logs_directory = r"C:\Users\84393\Downloads\Coomer\resources\config\logs"
    # Đường dẫn file JSON đầu ra
    output_json_file = r"D:\video-list.json"

    video_urls = extract_video_urls_from_directory(logs_directory)
    if not video_urls:
        print("No video URLs found in the specified directory.")
    else:
        save_video_list_as_json(video_urls, output_json_file)

if __name__ == "__main__":
    main()
