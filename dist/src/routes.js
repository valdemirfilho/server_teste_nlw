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
exports.appRoutes = void 0;
const prisma_1 = require("./lib/prisma");
const zod_1 = require("zod");
const dayjs_1 = __importDefault(require("dayjs"));
function appRoutes(app) {
    return __awaiter(this, void 0, void 0, function* () {
        app.post('/habits', (request) => __awaiter(this, void 0, void 0, function* () {
            const createHabitBody = zod_1.z.object({
                title: zod_1.z.string(),
                weekDays: zod_1.z.array(zod_1.z.number().min(0).max(6))
            });
            const { title, weekDays } = createHabitBody.parse(request.body);
            const today = (0, dayjs_1.default)().startOf('day').toDate();
            yield prisma_1.prisma.habit.create({
                data: {
                    title,
                    created_at: today,
                    weekDays: {
                        create: weekDays.map(weekDays => {
                            return {
                                week_day: weekDays,
                            };
                        })
                    }
                }
            });
        }));
        app.get('/day', (request) => __awaiter(this, void 0, void 0, function* () {
            const gatDayParams = zod_1.z.object({
                date: zod_1.z.coerce.date()
            });
            const { date } = gatDayParams.parse(request.query);
            const parsedDate = (0, dayjs_1.default)(date).startOf('day');
            const weekDay = parsedDate.get('day');
            const possibleHabits = yield prisma_1.prisma.habit.findMany({
                where: {
                    created_at: {
                        lte: date,
                    },
                    weekDays: {
                        some: {
                            week_day: weekDay,
                        }
                    }
                }
            });
            const day = yield prisma_1.prisma.day.findUnique({
                where: {
                    date: parsedDate.toDate(),
                },
                include: {
                    dayHabits: true
                }
            });
            const completedHabits = day === null || day === void 0 ? void 0 : day.dayHabits.map(dayHabit => {
                return dayHabit.habit_id;
            });
            return {
                possibleHabits,
                completedHabits
            };
        }));
        app.patch('/habits/:id/toggle', (request) => __awaiter(this, void 0, void 0, function* () {
            const toggleHabitParams = zod_1.z.object({
                id: zod_1.z.string().uuid()
            });
            const { id } = toggleHabitParams.parse(request.params);
            const today = (0, dayjs_1.default)().startOf('day').toDate();
            let day = yield prisma_1.prisma.day.findUnique({
                where: {
                    date: today,
                }
            });
            if (!day) {
                day = yield prisma_1.prisma.day.create({
                    data: {
                        date: today
                    }
                });
            }
            const dayHabit = yield prisma_1.prisma.dayHabit.findUnique({
                where: {
                    day_id_habit_id: {
                        day_id: day.id,
                        habit_id: id
                    }
                }
            });
            if (dayHabit) {
                yield prisma_1.prisma.dayHabit.delete({
                    where: {
                        id: dayHabit.id
                    }
                });
            }
            else {
                yield prisma_1.prisma.dayHabit.create({
                    data: {
                        day_id: day.id,
                        habit_id: id
                    }
                });
            }
        }));
        app.get('/summary', () => __awaiter(this, void 0, void 0, function* () {
            console.log('ta entrando aqui');
            const summary = yield prisma_1.prisma.$queryRaw `
  SELECT 
    D.id, 
    D.date,
    (
      SELECT 
        cast(count(*) as float)
      FROM day_habits DH 
      WHERE DH.day_id = D.id
    ) as completed,
    (
      SELECT 
       cast(count(*) as float)
      FROM habit_week_days HWD
      JOIN habits H 
        ON H.id = HWD.habit_id
      WHERE
        HWD.week_day = cast(strftime('%w', D.date/1000.0, 'unixepoch') as int)
        AND H.created_at <= D.date
    )as amount

  FROM days D
  `;
            return summary;
        }));
    });
}
exports.appRoutes = appRoutes;
