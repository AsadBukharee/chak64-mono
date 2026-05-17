import io
from PIL import Image
import cloudinary.uploader
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_file_view(request):
    """
    Handle file uploads. Returns { file_url: '...' }.
    Compresses images > 1MB to JPEG before saving to Cloudinary.
    """
    file = request.FILES.get('file')
    if not file:
        return Response({'error': 'No file provided'}, status=400)

    try:
        # Check if file is an image and > 1MB
        is_image = file.content_type.startswith('image/')
        file_size = file.size
        
        upload_data = file
        
        if is_image and file_size > 1024 * 1024:
            # Compress image
            img = Image.open(file)
            # Convert to RGB (in case it's RGBA or something else not supported by JPEG)
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            output = io.BytesIO()
            # Compress with quality=80
            img.save(output, format='JPEG', quality=80, optimize=True)
            output.seek(0)
            upload_data = output
            # Update filename to have .jpg extension
            filename = file.name.rsplit('.', 1)[0] + '.jpg'
        else:
            filename = file.name

        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            upload_data,
            resource_type="auto",
            public_id=filename.rsplit('.', 1)[0],
            folder="uploads"
        )

        return Response({'file_url': upload_result.get('secure_url')})

    except Exception as e:
        return Response({'error': str(e)}, status=500)
