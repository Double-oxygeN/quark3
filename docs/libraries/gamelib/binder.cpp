#include <iostream>
#include <fstream>
#include <string>
#include <vector>

void clean_file(std::string path) {
  std::ofstream cl;
  cl.open(path);
  cl.close();
}

int main(int argc, char const *argv[]) {
  std::vector<std::string> files{
    "./physics.js",
    "./Mouse.js",
    "./Keyboard.js",
    "./Tween.js",
    "./StdTransFunc.js",
    "./ImageMaster.js",
    "./SoundMaster.js",
    "./Painter2d.js",
    "./GameMaster.js"
  };
  std::string output_file_path = (argc > 1) ? argv[1] : "./gamelib-all.js"; // 出力先を変更可能
  clean_file(output_file_path); // ファイルを一旦空にする

  std::ofstream ofs(output_file_path, std::ios::out | std::ios::app); // 追記モードで書き込む
  std::string buf;

  for (auto itr = files.begin(); itr != files.end(); ++itr) {
    std::ifstream ifs(*itr);
    if (!ifs) {
      std::cerr << "Failed to open a file." << std::endl;
      break;
    } else {
      while (getline(ifs, buf)) {
        ofs << buf << std::endl;
      }
      ofs << std::endl;
    }
  }
  return 0;
}
