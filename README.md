WELCOME TO THE CLOWNHOUSE 🤡




Spaghetti to get OPENCV working (to process images of the pool table for Kelly Pool)

brew update


brew install opencv@4


brew link --force opencv@4


brew install cmake



sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
ln -s /opt/homebrew/Cellar/opencv/4.10.0_9/include/opencv4/opencv2 /opt/homebrew/Cellar/opencv/4.10.0_9/include/opencv2
OPENCV4NODEJS_DISABLE_AUTOBUILD=1 OPENCV_INCLUDE_DIR=/opt/homebrew/Cellar/opencv/4.10.0_9/include OPENCV_LIB_DIR=/opt/homebrew/Cellar/opencv/4.10.0_9/lib OPENCV_BIN_DIR=/opt/homebrew/Cellar/opencv/4.10.0_9/bin meteor npm install @u4/opencv4nodejs@6
OPENCV4NODEJS_DISABLE_AUTOBUILD=1 OPENCV_INCLUDE_DIR=/opt/homebrew/Cellar/opencv/4.10.0_9/include OPENCV_LIB_DIR=/opt/homebrew/Cellar/opencv/4.10.0_9/lib OPENCV_BIN_DIR=/opt/homebrew/Cellar/opencv/4.10.0_9/bin meteor npm run start