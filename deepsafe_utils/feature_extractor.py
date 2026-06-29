import numpy as np
import cv2
from skimage.feature import hog

def extract_features_from_bytes(file_bytes):
    np_arr = np.frombuffer(file_bytes, np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if image is None:
        raise Exception("Invalid image")

    image = cv2.resize(image, (224, 224))

    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # HOG features
    hog_features = hog(
        gray,
        orientations=9,
        pixels_per_cell=(16,16),
        cells_per_block=(2,2),
        block_norm="L2-Hys"
    )

    # Color histogram
    hist = cv2.calcHist(
        [image],
        [0,1,2],
        None,
        [8,8,8],
        [0,256,0,256,0,256]
    ).flatten()

    # Combine features
    features = np.hstack([hog_features, hist])

    return features.reshape(1, -1)
def extract_features_from_frame(frame):

    import cv2
    import numpy as np
    from skimage.feature import hog

    frame = cv2.resize(frame, (224, 224))

    gray = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2GRAY
    )

    hog_features = hog(
        gray,
        orientations=9,
        pixels_per_cell=(16,16),
        cells_per_block=(2,2),
        block_norm="L2-Hys"
    )

    hist = cv2.calcHist(
        [frame],
        [0,1,2],
        None,
        [8,8,8],
        [0,256,0,256,0,256]
    ).flatten()

    features = np.hstack([
        hog_features,
        hist
    ])

    return features.reshape(1,-1)