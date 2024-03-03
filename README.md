# Issie-Avalonia-demo-app
 Issie-Avalonia-demo-app for FYP24

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
