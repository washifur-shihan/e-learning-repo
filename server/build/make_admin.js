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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_model_1 = __importDefault(require("./models/user.model"));
dotenv_1.default.config();
const dbUrl = process.env.DB_URL || '';
const makeAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(dbUrl);
        console.log(`Database connected successfully to ${mongoose_1.default.connection.host}`);
        const user = yield user_model_1.default.findOne({ email: 'washifur.mail@gmail.com' });
        if (!user) {
            console.log("User not found with email: washifur.mail@gmail.com");
        }
        else {
            user.role = 'admin';
            yield user.save();
            console.log("Successfully upgraded washifur.mail@gmail.com to admin!");
        }
        process.exit(0);
    }
    catch (error) {
        console.log(`Error: ${error.message}`);
        process.exit(1);
    }
});
makeAdmin();
