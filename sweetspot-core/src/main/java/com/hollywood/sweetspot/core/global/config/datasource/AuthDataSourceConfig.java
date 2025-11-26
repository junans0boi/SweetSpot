package com.hollywood.sweetspot.core.global.config.datasource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.autoconfigure.orm.jpa.JpaProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(basePackages = "com.hollywood.sweetspot.core.domain.user.repository", entityManagerFactoryRef = "authEntityManagerFactory", transactionManagerRef = "authTransactionManager")
public class AuthDataSourceConfig {

    @Bean(name = "authProperties")
    @ConfigurationProperties(prefix = "datasources.auth")
    public DataSourceProperties authDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean(name = "authJpaProperties")
    @ConfigurationProperties(prefix = "datasources.auth.jpa")
    public JpaProperties authJpaProperties() {
        return new JpaProperties();
    }

    @Bean(name = "authDataSource")
    public DataSource authDataSource(@Qualifier("authProperties") DataSourceProperties properties) {
        return properties.initializeDataSourceBuilder()
                .driverClassName("org.mariadb.jdbc.Driver")
                .build();
    }

    @Bean(name = "authEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean authEntityManagerFactory(
            @Qualifier("authDataSource") DataSource dataSource,
            @Qualifier("authJpaProperties") JpaProperties jpaProps) {
        EntityManagerFactoryBuilder builder = new EntityManagerFactoryBuilder(
                new HibernateJpaVendorAdapter(), jpaProps.getProperties(), null
        );
        return builder
                .dataSource(dataSource)
                .packages("com.hollywood.sweetspot.core.domain.user.entity")
                .persistenceUnit("auth")
                .properties(jpaProps.getProperties())
                .build();
    }

    @Bean(name = "authTransactionManager")
    public PlatformTransactionManager authTransactionManager(
            @Qualifier("authEntityManagerFactory") LocalContainerEntityManagerFactoryBean emf) {
        return new JpaTransactionManager(emf.getObject());
    }
}