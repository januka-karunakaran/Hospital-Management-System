const fs = require("fs");
const path = require("path");

const appDir = path.join(__dirname, "app");
const componentsDir = path.join(__dirname, "components");

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      if (dirPath.endsWith(".js") || dirPath.endsWith(".jsx")) {
        callback(dirPath);
      }
    }
  });
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  let original = content;

  // Replace ../../components or ../components with specific aliases
  
  // Sidebar -> @/app/components/Sidebar
  content = content.replace(/from\s+['"](?:\.\.\/)+components\/Sidebar['"]/g, 'from "@/app/components/Sidebar"');
  // ProtectedRoute -> @/app/components/ProtectedRoute
  content = content.replace(/from\s+['"](?:\.\.\/)+components\/ProtectedRoute['"]/g, 'from "@/app/components/ProtectedRoute"');
  // Topbar -> @/app/components/Topbar
  content = content.replace(/from\s+['"](?:\.\.\/)+components\/Topbar['"]/g, 'from "@/app/components/Topbar"');
  // Charts -> @/components/Charts
  content = content.replace(/from\s+['"](?:\.\.\/)+components\/Charts['"]/g, 'from "@/components/Charts"');
  // SilentLogin -> @/app/components/SilentLogin
  content = content.replace(/from\s+['"](?:\.\.\/)+components\/SilentLogin['"]/g, 'from "@/app/components/SilentLogin"');
  
  // utils/auth -> @/utils/auth
  content = content.replace(/from\s+['"](?:\.\.\/)+utils\/auth['"]/g, 'from "@/utils/auth"');
  
  // services/... -> @/services/...
  content = content.replace(/from\s+['"](?:\.\.\/)+services\/(.*?)['"]/g, 'from "@/services/$1"');

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log("Updated", filePath);
  }
}

walkDir(appDir, processFile);
if (fs.existsSync(componentsDir)) {
  walkDir(componentsDir, processFile);
}
console.log("Done.");
