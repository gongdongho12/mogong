CREATE TABLE `user` (
  `id` varchar(20) NOT NULL DEFAULT '',
  `password` varchar(100) DEFAULT '',
  `name` varchar(20) NOT NULL DEFAULT '',
  `email` varchar(40) NOT NULL DEFAULT '',
  `signup_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `auth_type` varchar(10) NOT NULL DEFAULT 'local',
  `table_url` varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `project` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL DEFAULT '',
  `description` text,
  `author` varchar(20) NOT NULL,
  `visible` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `author` (`author`),
  CONSTRAINT `project_ibfk_1` FOREIGN KEY (`author`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `board` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `project_id` int(11) unsigned NOT NULL,
  `author` varchar(20) NOT NULL DEFAULT '',
  `contents` text,
  `datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `author` (`author`),
  CONSTRAINT `board_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `board_ibfk_2` FOREIGN KEY (`author`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `team` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `project_id` int(11) unsigned NOT NULL,
  `user_id` varchar(20) NOT NULL DEFAULT '',
  `type` int(3) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`project_id`),
  KEY `project_id` (`project_id`),
  CONSTRAINT `team_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `team_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `review` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `board_id` int(11) unsigned NOT NULL,
  `author` varchar(20) NOT NULL DEFAULT '',
  `contents` text NOT NULL,
  `datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `board_id` (`board_id`),
  KEY `author` (`author`),
  CONSTRAINT `review_ibfk_2` FOREIGN KEY (`board_id`) REFERENCES `board` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `review_ibfk_3` FOREIGN KEY (`author`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;