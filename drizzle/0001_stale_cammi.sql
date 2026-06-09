CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`trainerId` int NOT NULL,
	`date` date NOT NULL,
	`time` time NOT NULL,
	`duration` int DEFAULT 60,
	`status` enum('pending','confirmed','completed','cancelled') DEFAULT 'pending',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exercises` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` enum('chest','back','shoulders','biceps','triceps','forearms','legs','glutes','core','cardio','flexibility','other') NOT NULL,
	`description` text,
	`muscleGroup` varchar(255),
	`difficulty` enum('beginner','intermediate','advanced') DEFAULT 'beginner',
	`instructions` text,
	`imageUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exercises_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `foods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`calories` decimal(7,2) NOT NULL,
	`protein` decimal(5,2) NOT NULL,
	`fat` decimal(5,2) NOT NULL,
	`carbs` decimal(5,2) NOT NULL,
	`category` enum('protein','carbs','fats','vegetables','fruits','dairy','grains','other') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `foods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`foodId` int NOT NULL,
	`date` date NOT NULL,
	`quantity` decimal(6,2) NOT NULL,
	`mealType` enum('breakfast','lunch','dinner','snack') NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `meals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`age` int,
	`weight` decimal(5,2),
	`height` int,
	`goal` enum('weight_loss','muscle_gain','maintenance','endurance'),
	`bio` text,
	`profileImage` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `trainerAvailability` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trainerId` int NOT NULL,
	`dayOfWeek` int NOT NULL,
	`startTime` time NOT NULL,
	`endTime` time NOT NULL,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trainerAvailability_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weightHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`weight` decimal(5,2) NOT NULL,
	`date` date NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weightHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workoutExercises` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workoutId` int NOT NULL,
	`exerciseId` int NOT NULL,
	`sets` int NOT NULL,
	`reps` int NOT NULL,
	`weight` decimal(6,2),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workoutExercises_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` date NOT NULL,
	`notes` text,
	`duration` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','trainer','admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
CREATE INDEX `appointment_clientId_idx` ON `appointments` (`clientId`);--> statement-breakpoint
CREATE INDEX `appointment_trainerId_idx` ON `appointments` (`trainerId`);--> statement-breakpoint
CREATE INDEX `appointment_date_idx` ON `appointments` (`date`);--> statement-breakpoint
CREATE INDEX `appointment_status_idx` ON `appointments` (`status`);--> statement-breakpoint
CREATE INDEX `exercise_category_idx` ON `exercises` (`category`);--> statement-breakpoint
CREATE INDEX `exercise_name_idx` ON `exercises` (`name`);--> statement-breakpoint
CREATE INDEX `food_name_idx` ON `foods` (`name`);--> statement-breakpoint
CREATE INDEX `food_category_idx` ON `foods` (`category`);--> statement-breakpoint
CREATE INDEX `meal_userId_idx` ON `meals` (`userId`);--> statement-breakpoint
CREATE INDEX `meal_date_idx` ON `meals` (`date`);--> statement-breakpoint
CREATE INDEX `meal_foodId_idx` ON `meals` (`foodId`);--> statement-breakpoint
CREATE INDEX `profile_userId_idx` ON `profiles` (`userId`);--> statement-breakpoint
CREATE INDEX `availability_trainerId_idx` ON `trainerAvailability` (`trainerId`);--> statement-breakpoint
CREATE INDEX `weightHistory_userId_idx` ON `weightHistory` (`userId`);--> statement-breakpoint
CREATE INDEX `weightHistory_date_idx` ON `weightHistory` (`date`);--> statement-breakpoint
CREATE INDEX `workoutExercise_workoutId_idx` ON `workoutExercises` (`workoutId`);--> statement-breakpoint
CREATE INDEX `workoutExercise_exerciseId_idx` ON `workoutExercises` (`exerciseId`);--> statement-breakpoint
CREATE INDEX `workout_userId_idx` ON `workouts` (`userId`);--> statement-breakpoint
CREATE INDEX `workout_date_idx` ON `workouts` (`date`);--> statement-breakpoint
CREATE INDEX `role_idx` ON `users` (`role`);