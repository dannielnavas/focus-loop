#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Script para incrementar automáticamente la versión en package.json
 * Soporta incremento de patch, minor o major
 */

function incrementVersion(version, type = "patch") {
  const parts = version.split(".").map(Number);

  switch (type) {
    case "major":
      parts[0]++;
      parts[1] = 0;
      parts[2] = 0;
      break;
    case "minor":
      parts[1]++;
      parts[2] = 0;
      break;
    case "patch":
    default:
      parts[2]++;
      break;
  }

  return parts.join(".");
}

function updatePackageVersion() {
  const packagePath = path.join(__dirname, "..", "package.json");

  try {
    // Leer el package.json actual
    const packageContent = fs.readFileSync(packagePath, "utf8");
    const packageJson = JSON.parse(packageContent);

    // Obtener el tipo de incremento desde los argumentos de línea de comandos
    const incrementType = process.argv[2] || "patch";

    // Validar que el tipo sea válido
    if (!["patch", "minor", "major"].includes(incrementType)) {
      console.error(
        "❌ Tipo de incremento inválido. Use: patch, minor, o major"
      );
      process.exit(1);
    }

    // Incrementar la versión
    const oldVersion = packageJson.version;
    const newVersion = incrementVersion(oldVersion, incrementType);

    // Actualizar la versión en el objeto
    packageJson.version = newVersion;

    // Escribir el package.json actualizado
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + "\n");

    console.log(
      `✅ Versión actualizada: ${oldVersion} → ${newVersion} (${incrementType})`
    );

    // Retornar la nueva versión para uso en otros scripts
    return newVersion;
  } catch (error) {
    console.error("❌ Error actualizando la versión:", error.message);
    process.exit(1);
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  updatePackageVersion();
}

module.exports = { updatePackageVersion, incrementVersion };
