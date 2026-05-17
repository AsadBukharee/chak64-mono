import requests
import io
from PIL import Image

TOKEN = 'c7971cedba602f8c711393cb3fbb7a5a0b1104db'
URL = 'http://localhost:8000/api/upload/'

def create_large_image(size_mb=2):
    # Create an image that's roughly size_mb MB when saved as BMP (uncompressed)
    # 1 pixel is ~3 bytes in RGB
    # 1MB = 1024 * 1024 bytes
    pixels = (size_mb * 1024 * 1024) // 3
    side = int(pixels**0.5)
    img = Image.new('RGB', (side, side), color='red')
    buf = io.BytesIO()
    img.save(buf, format='BMP')
    print(f"Created dummy image of size: {len(buf.getvalue()) / (1024*1024):.2f} MB")
    return buf.getvalue()

def test_upload(file_bytes, filename):
    files = {'file': (filename, file_bytes, 'image/bmp')}
    headers = {'Authorization': f'Token {TOKEN}'}
    try:
        response = requests.post(URL, files=files, headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Test large image
    print("Testing large image (>1MB)...")
    large_image = create_large_image(size_mb=1.5)
    test_upload(large_image, 'test_large.bmp')
    
    # Test small image
    print("\nTesting small image (<1MB)...")
    small_image = create_large_image(size_mb=0.5)
    test_upload(small_image, 'test_small.bmp')
