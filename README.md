# Issie-Avalonia

Reimplementation of Issie in full .NET eco-system with Avalonia and Avalonia.FuncUI. Development in progress.

## About Issie - an Interactive Schematic Simulator with Integrated Editor

Issie (Interactive Schematic Simulator with Integrated Editor) is an application for digital circuit design and simulation. It is targeted at students and hobbyists that want to get a grasp of Digital Electronics concepts in a simple and fun way. Issie is designed to be beginner-friendly and guide the users toward their goals via clear error messages and visual clues. Issie is developed and actively used in teaching at Imperial College London.

* If you are just interested in using the application, jump to the [Getting Started](#getting-started) section. 
* If you want user documentation and news go to the [web pages](https://tomcl.github.io/issie/).
* If you are interested in a more detailed description of Issie please check out the [Wiki](https://github.com/tomcl/issie/wiki).

For more technical info about the project, read on. This documentation is partly based on the excellent [VisUAL2](https://github.com/ImperialCollegeLondon/Visual2) documentation, given the similarity in the technology stack used.


## Prerequisites

Before you begin, ensure you have met the following requirements:
* You have installed the .NET 7.0 

## Installation

To install this project, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/KaiwenLiu1227/Issie-Avalonia-demo-app
   ```
2. Navigate to the project directory:
   ```bash
   cd Issie-Avalonia-demo-app
   ```

## Restore Dependencies

```bash
dotnet restore
```
This command retrieves the project's dependencies.

## Building the Project

To build the project, run the following command in the root directory of your project:

```bash
dotnet build
```

This command compiles the project and its dependencies into a set of binaries.

## Running the Project

To run the project, execute the following command:

```bash
dotnet run
```

This will start the application.

## Build release version for multi-platform app

To build release version of the project, execute the following command:

```bash
dotnet publish -c Release --runtime linux-x64
```

replace `linux-x64` with your target platform like `win-x64` or `osx-x64`
