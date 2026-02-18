import jwt from "jsonwebtoken";

function hasPermissionValue(value) {
  if (value === true || value === 1) return true;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true";
  }
  if (Buffer.isBuffer(value)) {
    return value.length > 0 && value[0] === 1;
  }
  return false;
}

export default function authenticateToken(req, res, next) {
  const token =
    req.cookies?.accessToken ||
    req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "rahasia"
    );
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token tidak valid" });
  }
}

// Authorization middleware untuk mengecek role
// roles dapat berupa string (single role) atau array (multiple roles)
// Contoh: authorizeRoles('Administrator'), authorizeRoles(['Super User', 'Administrator'])
export function authorizeRoles(allowedRoles) {
  // Convert single string to array
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Silakan login terlebih dahulu" });
    }

    // Check by role_name (dari roles table)
    const userRoleName = req.user.role_name;
    const userRoleId = req.user.role_id;

    // Cek apakah role_name user ada di allowedRoles
    const isAuthorizedByName = rolesArray.includes(userRoleName);
    // Cek juga apakah role_id user ada di allowedRoles (untuk backward compatibility)
    const isAuthorizedById = rolesArray.includes(userRoleId);

    if (!isAuthorizedByName && !isAuthorizedById) {
      return res.status(403).json({ 
        message: "Akses ditolak. Akses terbatas untuk role: " + rolesArray.join(", ") 
      });
    }

    next();
  };
}

// Authorization middleware untuk mengecek permission khusus
// permissions: can_create, can_read, can_view, can_update, can_approve, can_delete, can_provision
// Contoh: authorizePermission('can_delete'), authorizePermission(['can_create', 'can_update'])
export function authorizePermission(permissions) {
  const permissionsArray = Array.isArray(permissions) ? permissions : [permissions];
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Silakan login terlebih dahulu" });
    }

    // Get user permissions dari token
    const userPermissions = req.user.permissions || {};

    // Cek apakah user memiliki salah satu permission yang diizinkan
    const hasPermission = permissionsArray.some((perm) => hasPermissionValue(userPermissions[perm]));

    if (!hasPermission) {
      return res.status(403).json({ 
        message: "Anda tidak memiliki permission untuk melakukan aksi ini" 
      });
    }

    next();
  };
}
