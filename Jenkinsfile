
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend Build') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Frontend Build') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Docker Compose Validation') {
            steps {
                sh 'docker compose config -q'
            }
        }
    }

    post {
        success {
            echo 'DueWise CI pipeline completed successfully!'
        }
        failure {
            echo 'DueWise pipeline failed. Check the stage logs.'
        }
    }
}
