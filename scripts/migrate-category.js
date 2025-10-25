"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// scripts/migrate-category.ts
var firebase_1 = require("../lib/firebase");
var firestore_1 = require("firebase/firestore");
function migratePersonalProjectToDiary() {
    return __awaiter(this, void 0, void 0, function () {
        var photosRef, q, snapshot, successCount, errorCount, _i, _a, docSnapshot, docRef, error_1, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("🔄 Starting migration: personal-project → diary");
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 9, , 10]);
                    photosRef = (0, firestore_1.collection)(firebase_1.db, "photos");
                    q = (0, firestore_1.query)(photosRef, (0, firestore_1.where)("category", "==", "Luidji and Tuerie from Foufoune Palace at Paris Fashion week 2025"));
                    return [4 /*yield*/, (0, firestore_1.getDocs)(q)];
                case 2:
                    snapshot = _b.sent();
                    if (snapshot.empty) {
                        console.log("✓ No documents found with category 'personal-project'");
                        return [2 /*return*/];
                    }
                    console.log("\uD83D\uDCE6 Found ".concat(snapshot.size, " document(s) to migrate"));
                    successCount = 0;
                    errorCount = 0;
                    _i = 0, _a = snapshot.docs;
                    _b.label = 3;
                case 3:
                    if (!(_i < _a.length)) return [3 /*break*/, 8];
                    docSnapshot = _a[_i];
                    _b.label = 4;
                case 4:
                    _b.trys.push([4, 6, , 7]);
                    docRef = (0, firestore_1.doc)(firebase_1.db, "photos", docSnapshot.id);
                    return [4 /*yield*/, (0, firestore_1.updateDoc)(docRef, {
                            category: "Luidji-and-Tuerie-from-Foufoune-Palace-at-Paris-Fashion-week-2025"
                        })];
                case 5:
                    _b.sent();
                    console.log("\u2713 Migrated: ".concat(docSnapshot.id));
                    successCount++;
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _b.sent();
                    console.error("\u2717 Error migrating ".concat(docSnapshot.id, ":"), error_1);
                    errorCount++;
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 3];
                case 8:
                    console.log("\n📊 Migration Summary:");
                    console.log("\u2713 Successfully migrated: ".concat(successCount));
                    console.log("\u2717 Errors: ".concat(errorCount));
                    console.log("\uD83D\uDCE6 Total processed: ".concat(snapshot.size));
                    return [3 /*break*/, 10];
                case 9:
                    error_2 = _b.sent();
                    console.error("❌ Migration failed:", error_2);
                    throw error_2;
                case 10: return [2 /*return*/];
            }
        });
    });
}
// Exécuter la migration
migratePersonalProjectToDiary()
    .then(function () {
    console.log("\n✅ Migration completed successfully!");
    process.exit(0);
})
    .catch(function (error) {
    console.error("\n❌ Migration failed with error:", error);
    process.exit(1);
});
