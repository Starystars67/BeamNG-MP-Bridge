project(Bridge C CXX)
cmake_minimum_required(VERSION 3.15)

include(cmake/App.cmake)

set(SOURCES "src/Bridge.h"
            "src/Bridge.cpp"
            "src/main.cpp")

add_app("${SOURCES}")