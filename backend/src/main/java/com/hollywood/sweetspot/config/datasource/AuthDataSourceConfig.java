package com.hollywood.sweetspot.config.datasource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.autoconfigure.orm.jpa.JpaProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;


@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
        basePackages = "com.hollywood.sweetspot.user.repository",
        entityManagerFactoryRef = "authEntityManagerFactory",
        transactionManagerRef = "authTransactionManager"
)
public class AuthDataSourceConfig {

    @Primary
    @Bean(name = "authProperties")
    @ConfigurationProperties(prefix = "datasources.auth")
    public DataSourceProperties authDataSourceProperties() {
        return new DataSourceProperties();
    }

    // 🔸 datasources.auth.jpa.* 를 매핑할 전용 JpaProperties
    @Primary
    @Bean(name = "authJpaProperties")
    @ConfigurationProperties(prefix = "datasources.auth.jpa")
    public JpaProperties authJpaProperties() {
        return new JpaProperties();
    }

    @Primary
    @Bean(name = "authDataSource")
    public DataSource authDataSource(@Qualifier("authProperties") DataSourceProperties properties) {
        return properties.initializeDataSourceBuilder().build();
    }

    @Primary
    @Bean(name = "authEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean authEntityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("authDataSource") DataSource dataSource,
            @Qualifier("authJpaProperties") JpaProperties jpaProps
    ) {
        return builder
                .dataSource(dataSource)
                .packages("com.hollywood.sweetspot.user.model")
                .persistenceUnit("auth")
                .properties(jpaProps.getProperties()) // ✅ 핵심: JPA 속성 주입
                .build();
    }

    @Primary
    @Bean(name = "authTransactionManager")
    public PlatformTransactionManager authTransactionManager(
            @Qualifier("authEntityManagerFactory") LocalContainerEntityManagerFactoryBean emf) {
        return new JpaTransactionManager(emf.getObject());
    }
}