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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const firstHabitId = '0730ffac-d039-4194-9571-01aa2aa0efbd';
const firstHabitCreationDate = new Date('2022-12-31T03:00:00.000');
const secondHabitId = '00880d75-a933-4fef-94ab-e05744435297';
const secondHabitCreationDate = new Date('2023-01-03T03:00:00.000');
const thirdHabitId = 'fa1a1bcf-3d87-4626-8c0d-d7fd1255ac00';
const thirdHabitCreationDate = new Date('2023-01-08T03:00:00.000');
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        yield prisma.habit.deleteMany();
        yield prisma.day.deleteMany();
        /**
         * Create habits
         */
        yield Promise.all([
            prisma.habit.create({
                data: {
                    id: firstHabitId,
                    title: 'Beber 2L água',
                    created_at: firstHabitCreationDate,
                    weekDays: {
                        create: [
                            { week_day: 1 },
                            { week_day: 2 },
                            { week_day: 3 },
                        ]
                    }
                }
            }),
            prisma.habit.create({
                data: {
                    id: secondHabitId,
                    title: 'Exercitar',
                    created_at: secondHabitCreationDate,
                    weekDays: {
                        create: [
                            { week_day: 3 },
                            { week_day: 4 },
                            { week_day: 5 },
                        ]
                    }
                }
            }),
            prisma.habit.create({
                data: {
                    id: thirdHabitId,
                    title: 'Dormir 8h',
                    created_at: thirdHabitCreationDate,
                    weekDays: {
                        create: [
                            { week_day: 1 },
                            { week_day: 2 },
                            { week_day: 3 },
                            { week_day: 4 },
                            { week_day: 5 },
                        ]
                    }
                }
            })
        ]);
        yield Promise.all([
            /**
             * Habits (Complete/Available): 1/1
             */
            prisma.day.create({
                data: {
                    /** Monday */
                    date: new Date('2023-01-02T03:00:00.000z'),
                    dayHabits: {
                        create: {
                            habit_id: firstHabitId,
                        }
                    }
                }
            }),
            /**
             * Habits (Complete/Available): 1/1
             */
            prisma.day.create({
                data: {
                    /** Friday */
                    date: new Date('2023-01-06T03:00:00.000z'),
                    dayHabits: {
                        create: {
                            habit_id: firstHabitId,
                        }
                    }
                }
            }),
            /**
             * Habits (Complete/Available): 2/2
             */
            prisma.day.create({
                data: {
                    /** Wednesday */
                    date: new Date('2023-01-04T03:00:00.000z'),
                    dayHabits: {
                        create: [
                            { habit_id: firstHabitId },
                            { habit_id: secondHabitId },
                        ]
                    }
                }
            }),
        ]);
    });
}
run()
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}))
    .catch((e) => __awaiter(void 0, void 0, void 0, function* () {
    console.error(e);
    yield prisma.$disconnect();
    process.exit(1);
}));
