#include "first_app.hpp"

#include "keyboard_movement_controller.hpp"
#include "lve_camera.hpp"
#include "lve_game_object.hpp"
#include <glm/ext/scalar_constants.hpp>
#include <glm/fwd.hpp>
#include <glm/trigonometric.hpp>
#include <string>
#include <vector>



// libs
#define GLM_FORCE_RADIANS
#define GLM_FORCE_DEPTH_ZERO_TO_ONE
#include <glm/glm.hpp>
#include <glm/gtc/constants.hpp>
#include <iostream>

// std
#include <array>
#include <cassert>
#include <chrono>
#include <stdexcept>
#include <memory>

namespace lve {

FirstApp::FirstApp() { loadGameObjects(); }

FirstApp::~FirstApp() {}

void FirstApp::run() {
  SimpleRenderSystem simpleRenderSystem{lveDevice, lveRenderer.getSwapChainRenderPass()};
  LveCamera camera{};
  camera.setViewTarget(glm::vec3(-1.f, -2.f, 2.f), glm::vec3(0.f, 0.f, 2.5f));

  auto viewerObject = LveGameObject::createGameObject();
  KeyboardMovementController cameraController{};

  auto start = std::chrono::high_resolution_clock::now();

  while (!lveWindow.shouldClose()) {
    glfwPollEvents();

    auto now = std::chrono::high_resolution_clock::now();
    float dt = std::chrono::duration<float, std::chrono::seconds::period>(now - start).count();
    start = now;

    cameraController.moveInplaneXZ(lveWindow.getGLFWWindown(), dt, viewerObject);
    camera.setViewYXZ(viewerObject.transform.translation, viewerObject.transform.rotation);

    float aspect = lveRenderer.getAspectRatio();
    camera.setPerspectiveProjection(glm::radians(50.f), aspect, 0.1f, 10.f);


    if (auto commandBuffer = lveRenderer.beginFrame()) {
      lveRenderer.beginSwapChainRenderPass(commandBuffer);
      simpleRenderSystem.renderGameObjects(commandBuffer, gameObjects, camera);
      lveRenderer.endSwapChainRenderPass(commandBuffer);
      lveRenderer.endFrame();
    }
  }

  vkDeviceWaitIdle(lveDevice.device());
}



void FirstApp::loadGameObjects() {
  std::vector<bool> hasBeenDone{};
  std::vector<std::shared_ptr<LveModel>> uniqueModels{};
  uniqueModels.resize(1);
  hasBeenDone.resize(1);

  const std::string filePath = "modelTmp/untitled.gltf";
  tinygltf::Model model;
  tinygltf::TinyGLTF loader;
  std::string err, warn;

  if (!loader.LoadASCIIFromFile(&model, &err, &warn, filePath.c_str())) {
      throw std::runtime_error(warn + err);
  }

  const size_t dirEnd = filePath.rfind('/');
  std::string directory;
  if (std::string::npos != dirEnd) {
      directory = filePath.substr(0, dirEnd + 1);
  }

  tinygltf::Scene &scene = model.scenes[model.defaultScene];

  std::cout << "starting" << std::endl;

  for(size_t i = 0; i < model.nodes.size(); i++) {
    auto node = model.nodes.at(i);
    if(node.mesh != -1) {
      if (hasBeenDone.size() <= node.mesh) {
        hasBeenDone.resize(node.mesh + 1);
        uniqueModels.resize(node.mesh + 1);
      } else if (hasBeenDone.at(node.mesh)) continue;

      hasBeenDone.at(node.mesh) = 1;
      std::shared_ptr<LveModel> lveModel = LveModel::createModelFromNode(lveDevice, directory, model, i);
      uniqueModels.at(node.mesh) = lveModel;
    }
  }

  
  for (const auto &iNode : scene.nodes) {
    const auto &node = model.nodes.at(iNode);

    if(node.mesh != -1) {
      auto gameObject = LveGameObject::createGameObject();

      gameObject.model = uniqueModels.at(node.mesh);
      

      if(node.translation.size()) {
        gameObject.transform.translation = {node.translation.at(0),
                                            node.translation.at(1), 
                                            node.translation.at(2)};
      }

      if (node.rotation.size()) {
        gameObject.transform.rotation = { asin(node.rotation.at(2)) * 2,
                                          asin(node.rotation.at(1)) * 2,
                                          asin(node.rotation.at(3)) * 2};
      }

      for (const auto &child: node.children) {
        const auto childNode = model.nodes.at(child);

        auto chilObject = LveGameObject::createGameObject();
        chilObject.model = uniqueModels.at(childNode.mesh);
        chilObject.transform.translation = gameObject.transform.translation;
        if (childNode.translation.size()) {
          chilObject.transform.translation += glm::vec3{childNode.translation.at(0),
                                                        childNode.translation.at(1),
                                                        childNode.translation.at(2)};
        }

        gameObjects.push_back(std::move(chilObject));
      }

      gameObjects.push_back(std::move(gameObject));
    }
  }
  std::cout << "game objects count :" << gameObjects.size() << '\n';
  std::cout << "loading finish" << std::endl;

}

}  // namespace lve
