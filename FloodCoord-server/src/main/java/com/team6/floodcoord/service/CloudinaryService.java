package com.team6.floodcoord.service;


import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;
    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024;   // 5MB
    private static final long MAX_VIDEO_SIZE = 25 * 1024 * 1024;  // 25MB



    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }


    public String uploadMedia(MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        String contentType = file.getContentType();
        long fileSize = file.getSize();

        String resourceType;

        if (contentType != null && contentType.startsWith("image/")) {

            if (fileSize > MAX_IMAGE_SIZE) {
                throw new RuntimeException("Image must be <= 5MB");
            }

            resourceType = "image";

        } else if (contentType != null && contentType.startsWith("video/")) {

            if (fileSize > MAX_VIDEO_SIZE) {
                throw new RuntimeException("Video must be <= 25MB");
            }

            resourceType = "video";

        } else {
            throw new RuntimeException("Only image and video files allowed");
        }

        Map<?, ?> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", "floodcoord/rescue_requests",
                        "public_id", UUID.randomUUID().toString(),
                        "resource_type", resourceType,
                        "quality", "auto",
                        "fetch_format", "auto"
                )
        );

        return result.get("secure_url").toString();
    }
}