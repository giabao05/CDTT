package com.phonestore.backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
	CommandLineRunner alterTables(JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				jdbcTemplate.execute("ALTER TABLE products MODIFY COLUMN thumbnail MEDIUMTEXT");
				jdbcTemplate.execute("ALTER TABLE product_images MODIFY COLUMN image_url MEDIUMTEXT");
				jdbcTemplate.execute("ALTER TABLE product_variants MODIFY COLUMN image_url MEDIUMTEXT");
				System.out.println("Database columns updated to MEDIUMTEXT successfully.");
			} catch (Exception e) {
				System.err.println("Could not alter tables: " + e.getMessage());
			}
		};
	}
}
