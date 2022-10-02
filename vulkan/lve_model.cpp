#include "lve_model.hpp"

// #define TINYGLTF_NOEXCEPTION // optional. disable exception handling.

#include <fstream>
#include <glm/fwd.hpp>
#include <stdexcept>
#include <vector>
#define TINYGLTF_IMPLEMENTATION
#define STB_IMAGE_IMPLEMENTATION
#define STB_IMAGE_WRITE_IMPLEMENTATION
#include "libs/tiny_gltf.h"


// std
#include <cassert>
#include <cstring>
#include <vulkan/vulkan_core.h>
#include <iostream>

namespace lve {

LveModel::LveModel(LveDevice &device, const LveModel::Builder &builder) : lveDevice{device} {
  createVertexBuffers(builder.vertices);
  createIndexBuffers(builder.indices);
  
}

LveModel::~LveModel() {
  vkDestroyBuffer(lveDevice.device(), vertexBuffer, nullptr);
  vkFreeMemory(lveDevice.device(), vertexBufferMemory, nullptr);

  if(hasIndexBuffer) {
    vkDestroyBuffer(lveDevice.device(), indexBuffer, nullptr);
    vkFreeMemory(lveDevice.device(), indexBufferMemory, nullptr);
  }
}

void LveModel::createVertexBuffers(const std::vector<Vertex> &vertices) {
  vertexCount = static_cast<uint32_t>(vertices.size());
  assert(vertexCount >= 3 && "Vertex count must be at least 3");
  VkDeviceSize bufferSize = sizeof(vertices[0]) * vertexCount;

  VkBuffer stagingBuffer;
  VkDeviceMemory stagingBufferMemory;
  lveDevice.createBuffer(
      bufferSize,
      VK_BUFFER_USAGE_TRANSFER_SRC_BIT,
      VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT,
      stagingBuffer,
      stagingBufferMemory);

  void *data;
  vkMapMemory(lveDevice.device(), stagingBufferMemory, 0, bufferSize, 0, &data);
  memcpy(data, vertices.data(), static_cast<size_t>(bufferSize));
  vkUnmapMemory(lveDevice.device(), stagingBufferMemory);

    lveDevice.createBuffer(
      bufferSize,
      VK_BUFFER_USAGE_VERTEX_BUFFER_BIT | VK_BUFFER_USAGE_TRANSFER_DST_BIT,
      VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT,
      vertexBuffer,
      vertexBufferMemory);

  lveDevice.copyBuffer(stagingBuffer, vertexBuffer, bufferSize);

  vkDestroyBuffer(lveDevice.device(), stagingBuffer, nullptr);
  vkFreeMemory(lveDevice.device(), stagingBufferMemory, nullptr);

}

void LveModel::createIndexBuffers(const std::vector<uint32_t> &indices) {
  indexCount = static_cast<uint32_t>(indices.size());
  hasIndexBuffer = indexCount > 0;

  if (!hasIndexBuffer) return;

  VkDeviceSize bufferSize = sizeof(indices[0]) * indexCount;  
  
  VkBuffer stagingBuffer;
  VkDeviceMemory stagingBufferMemory;
  lveDevice.createBuffer(
      bufferSize,
      VK_BUFFER_USAGE_TRANSFER_SRC_BIT,
      VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT,
      stagingBuffer,
      stagingBufferMemory);

  void *data;
  vkMapMemory(lveDevice.device(), stagingBufferMemory, 0, bufferSize, 0, &data);
  memcpy(data, indices.data(), static_cast<size_t>(bufferSize));
  vkUnmapMemory(lveDevice.device(), stagingBufferMemory);

    lveDevice.createBuffer(
      bufferSize,
      VK_BUFFER_USAGE_INDEX_BUFFER_BIT | VK_BUFFER_USAGE_TRANSFER_DST_BIT,
      VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT,
      indexBuffer,
      indexBufferMemory);

  lveDevice.copyBuffer(stagingBuffer, indexBuffer, bufferSize);

  vkDestroyBuffer(lveDevice.device(), stagingBuffer, nullptr);
  vkFreeMemory(lveDevice.device(), stagingBufferMemory, nullptr);

}

void LveModel::draw(VkCommandBuffer commandBuffer) {
  if (hasIndexBuffer) vkCmdDrawIndexed(commandBuffer, indexCount, 1, 0, 0, 0);
  else vkCmdDraw(commandBuffer, vertexCount, 1, 0, 0);
}

void LveModel::bind(VkCommandBuffer commandBuffer) {
  VkBuffer buffers[] = {vertexBuffer};
  VkDeviceSize offsets[] = {0};
  vkCmdBindVertexBuffers(commandBuffer, 0, 1, buffers, offsets);

  if (hasIndexBuffer) {
    vkCmdBindIndexBuffer(commandBuffer, indexBuffer, 0, VK_INDEX_TYPE_UINT32);
  }
}

std::vector<VkVertexInputBindingDescription> LveModel::Vertex::getBindingDescriptions() {
  std::vector<VkVertexInputBindingDescription> bindingDescriptions(1);
  bindingDescriptions[0].binding = 0;
  bindingDescriptions[0].stride = sizeof(Vertex);
  bindingDescriptions[0].inputRate = VK_VERTEX_INPUT_RATE_VERTEX;
  return bindingDescriptions;
}

std::vector<VkVertexInputAttributeDescription> LveModel::Vertex::getAttributeDescriptions() {
  std::vector<VkVertexInputAttributeDescription> attributeDescriptions(2);
  attributeDescriptions[0].binding = 0;
  attributeDescriptions[0].location = 0;
  attributeDescriptions[0].format = VK_FORMAT_R32G32B32_SFLOAT;
  attributeDescriptions[0].offset = offsetof(Vertex, position);

  attributeDescriptions[1].binding = 0;
  attributeDescriptions[1].location = 1;
  attributeDescriptions[1].format = VK_FORMAT_R32G32B32_SFLOAT;
  attributeDescriptions[1].offset = offsetof(Vertex, color);
  return attributeDescriptions;
}

std::unique_ptr<LveModel> LveModel::createModelFromNode(LveDevice &device, const std::string &filePath, tinygltf::Model &model, const int node) {
  Builder builder;
  builder.loadModel(filePath, model, node);
  return std::make_unique<LveModel>(device, builder);
}

void LveModel::Builder::loadModel(const std::string &directory, tinygltf::Model &model, const int node) {

  vertices.clear();
  indices.clear();

  //TODO rework here like a lot
  //node = nodeIndex

  // for (const auto &mesh : model.meshes) {
  std::vector<glm::vec3> position{};
  std::vector<glm::vec3> normal{};
  std::vector<glm::vec2> uv{};


  const auto &meshIndex = model.nodes.at(node).mesh;
  const auto &mesh = model.meshes.at(meshIndex);
  const auto &accessor = model.accessors;

  for (const auto &primitives : mesh.primitives) {
    for (const auto &attribute : primitives.attributes) {
      if (attribute.first == "POSITION") {
        LveModel::readGLTFBuffer<std::vector<glm::vec3>>(model, directory, position, attribute.second);
      } else if (attribute.first == "NORMAL") {
        LveModel::readGLTFBuffer<std::vector<glm::vec3>>(model, directory, normal, attribute.second);
      } else if (attribute.first == "TEXCOORD_0") {
        LveModel::readGLTFBuffer<std::vector<glm::vec2>>(model, directory, uv, attribute.second);
      }
    }
    const auto &accessorIndex = primitives.indices;
    if (model.accessors.at(accessorIndex).componentType == 5125) {
      LveModel::readGLTFBuffer<std::vector<uint32_t>>(model, directory, indices, accessorIndex);
    } else {
      LveModel::readGLTFBuffer<std::vector<uint16_t>>(model, directory, indices, accessorIndex);
    }
  }

  for (size_t i = 0; i < position.size(); i++) {
    Vertex vertex{};
    vertex.position = position.at(i);
    vertex.color = normal.at(i);
    vertex.normal = normal.at(i);
    vertex.uv = uv.at(i);
    
    vertices.push_back(vertex);
  }

}

template<class T>
void LveModel::readGLTFBuffer(tinygltf::Model &model, const std::string &directory, T &location, int accessorIndex) {
    const auto &accessor = model.accessors.at(accessorIndex);
    const auto &count = accessor.count;
    const auto &bufferViewIndex = accessor.bufferView;

    const auto &bufferView = model.bufferViews.at(bufferViewIndex);
    const auto &byteOffset = bufferView.byteOffset;
    const auto &byteLength = bufferView.byteLength;
    const auto &bufferIndex = bufferView.buffer;

    const auto &buffer = model.buffers.at(bufferIndex);
    const auto &uri = buffer.uri;

    std::ifstream file{directory + uri, std::ios::binary};
    if(!file.is_open()) {
        throw std::runtime_error("failed to load " + uri);
    }
    
    T storage(count);
    file.seekg(byteOffset);
    file.read(reinterpret_cast<char *>(storage.data()), byteLength);

    // location.reserve(location.size() + count);
    location.insert(location.end(), storage.begin(), storage.end());

}

template<class T>
void LveModel::readGLTFBuffer(tinygltf::Model &model, const std::string &directory, std::vector<uint32_t> &location, int accessorIndex) {
    const auto &accessor = model.accessors.at(accessorIndex);
    const auto &count = accessor.count;
    const auto &bufferViewIndex = accessor.bufferView;

    const auto &bufferView = model.bufferViews.at(bufferViewIndex);
    const auto &byteOffset = bufferView.byteOffset;
    const auto &byteLength = bufferView.byteLength;
    const auto &bufferIndex = bufferView.buffer;

    const auto &buffer = model.buffers.at(bufferIndex);
    const auto &uri = buffer.uri;

    std::ifstream file{directory + uri, std::ios::binary};
    if(!file.is_open()) {
        throw std::runtime_error("failed to load " + uri);
    }
    
    T storage(count);
    file.seekg(byteOffset);
    file.read(reinterpret_cast<char *>(storage.data()), byteLength);

    // location.reserve(location.size() + count);
    location.insert(location.end(), storage.begin(), storage.end());
    
}

}  // namespace lve