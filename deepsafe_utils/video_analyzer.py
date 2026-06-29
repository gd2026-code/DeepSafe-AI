import cv2
import tempfile

def extract_frames(video_bytes, frame_skip=5):

    temp_file = tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".mp4"
    )

    temp_file.write(video_bytes)
    temp_file.close()

    cap = cv2.VideoCapture(temp_file.name)

    frames = []
    count = 0

    while True:

        success, frame = cap.read()

        if not success:
            break

        if count % frame_skip == 0:
            frames.append(frame)

        count += 1

    cap.release()

    return frames