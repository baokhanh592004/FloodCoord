# ============================================
# MULTI-STAGE DOCKERFILE FOR SPRING BOOT APPLICATION
# ============================================
# Stage 1: Build application
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copy pom.xml và download dependencies (layer caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build application (skip tests nếu muốn build nhanh hơn)
# Để chạy tests: RUN mvn clean package -B
# Để skip tests: RUN mvn clean package -B -DskipTests
RUN mvn clean package -B -DskipTests

# Stage 2: Runtime image
FROM eclipse-temurin:21-jre-alpine

# Metadata
LABEL maintainer="Team 4"
LABEL description="Laboratory Management Application"

# Cấu hình múi giờ Việt Nam
ENV TZ=Asia/Ho_Chi_Minh

# Tạo user non-root để chạy application (security best practice)
RUN addgroup -S spring && adduser -S spring -G spring

WORKDIR /app

# Copy JAR file từ build stage
COPY --from=build /app/target/*.jar app.jar

# Change ownership cho user spring
RUN chown spring:spring app.jar

# Chuyển sang user spring
USER spring:spring

# Expose port
EXPOSE 8083

ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -XX:+UseStringDeduplication"

# Run application
# Sử dụng exec form để nhận signals đúng cách
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

