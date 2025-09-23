package com.hollywood.sweetspot.config.datasource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
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
        // 🔻 이 DB를 사용할 Repository가 있는 패키지 경로
        basePackages = "com.hollywood.sweetspot.user.repository",
        entityManagerFactoryRef = "authEntityManagerFactory",
        transactionManagerRef = "authTransactionManager"
)
public class AuthDataSourceConfig {

    // 1. application.yml의 datasource.auth 설정을 읽어옴
    @Primary
    @Bean(name = "authProperties")
    @ConfigurationProperties(prefix = "datasources.auth")
    public DataSourceProperties authDataSourceProperties() {
        return new DataSourceProperties();
    }

    // 2. DataSource 객체 생성 (커넥션 풀)
    @Primary
    @Bean(name = "authDataSource")
    public DataSource authDataSource(@Qualifier("authProperties") DataSourceProperties properties) {
        return properties.initializeDataSourceBuilder().build();
    }

    // 3. JPA EntityManagerFactory 설정
    @Primary
    @Bean(name = "authEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean authEntityManagerFactory(EntityManagerFactoryBuilder builder, @Qualifier("authDataSource") DataSource dataSource) {
        return builder
                .dataSource(dataSource)
                // 🔻 이 DB를 사용할 Entity가 있는 패키지 경로
                .packages("com.hollywood.sweetspot.user.model")
                .persistenceUnit("auth")
                .build();
    }

    // 4. 트랜잭션 매니저 설정
    @Primary
    @Bean(name = "authTransactionManager")
    public PlatformTransactionManager authTransactionManager(@Qualifier("authEntityManagerFactory") LocalContainerEntityManagerFactoryBean entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory.getObject());
    }
}
