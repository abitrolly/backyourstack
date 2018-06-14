import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import { Link } from '../routes';

import {
  getProfile,
  getReposForProfile,
} from '../lib/github';

import {
  getAllDependenciesFromRepos,
  addProjectToDependencies,
  getRecommendedProjectFromDependencies,
} from '../lib/utils';

import Header from '../components/Header';
import Content from '../components/Content';
import Footer from '../components/Footer';

import DependencyTable from '../components/DependencyTable';
import RepositoryTable from '../components/RepositoryTable';

export default class Profile extends React.Component {

  static async getInitialProps ({ req, query }) {
    try {
      const accessToken = get(req, 'session.passport.user.accessToken');
      const profile = await getProfile(query.id, accessToken);
      const repos = await getReposForProfile(profile, accessToken);
      const dependencies = await getAllDependenciesFromRepos(repos).then(addProjectToDependencies);
      const recommendations = await getRecommendedProjectFromDependencies(dependencies);
      return { profile, repos, dependencies, recommendations };
    } catch (error) {
      return { error };
    }
  }

  static propTypes = {
    pathname: PropTypes.string,
    loggedInUser: PropTypes.object,
    profile: PropTypes.object,
    repos: PropTypes.array,
    dependencies: PropTypes.array,
    recommendations: PropTypes.array,
    error: PropTypes.object,
  }

  render () {
    const { error, profile, repos, dependencies, recommendations, pathname, loggedInUser } = this.props;
    return (
      <div>
        <style jsx>{`
        .Recommendations {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
        }
        .Recommendation {
          width: 180px;
          min-height: 300px;
          border-radius: 15px;
          background-color: #ffffff;
          box-shadow: 0 1px 3px 0 rgba(45, 77, 97, 0.2);
          margin: 10px;
          padding: 15px;
          text-align: center;
        }
        .Recommendation .name {
          height: 50px;
        }
        .Recommendation .description {
          font-size: 12px;
          color: #333;
          height: 100px;
        }
        .Recommendation .repos {
          height: 100px;
          font-size: 12px;
        }
        .Recommendation .repos {
          color: #333;
        }
        .Recommendation .repos a {
          color: #666;
        }
        .Recommendation .repos a:hover {
          color: #333;
          text-decoration: none;
        }
        .back-button {

        }
        .back-button a {
          display: block;
          border-radius: 15px;
          padding: 10px;
          text-decoration: none;
          background: #333;
          color: white;
        }
        .back-button a:hover {
          background: #666;
        }
        `}
        </style>
        <Header loggedInUser={loggedInUser} pathname={pathname} />
        <Content>
          {error &&
            <div>
              <p>{error.message}</p>
              <Link route="login" params={{ next: pathname }}>
                <a>Please Sign In with GitHub to avoid rate limit errors.</a>
              </Link>
            </div>
          }
          {!error &&
            <div>
              <h1>{profile.name}</h1>
              <div>
                <strong>Github Profile</strong>:&nbsp;
                <a href={`https://github.com/${profile.login}`}>github.com/{profile.login}</a>
                &nbsp;-&nbsp;
                <strong>OpenCollective Profile</strong>:&nbsp;
                <em>unknown</em>
              </div>
              <h2>Recommendations</h2>
              <div className="Recommendations">
                {recommendations.filter(r => r.opencollective).map(recommendation => (
                  <div key={recommendation.id} className="Recommendation">
                    {recommendation.opencollective && (
                      <>
                        <div className="name"><b>{recommendation.opencollective.name}</b></div>
                        <div className="description">{recommendation.opencollective.description}</div>
                        <div className="repos">
                          <strong>Used in</strong>:&nbsp;
                          {recommendation.repos.slice(0, 3).map(repo => (
                            <span key={repo.id}>
                              <a href={`https://github.com/${repo.full_name}`}>{repo.full_name}</a>
                            </span>
                          )).reduce( ( prev, curr ) => [ prev, ', ', curr ] )}
                          {recommendation.repos.length > 3 && ` and ${recommendation.repos.length - 3 } others`}
                        </div>
                        <div className="back-button">
                          <a href={`https://opencollective.com/${recommendation.opencollective.slug}`}>
                            Back this project
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <h2>Dependencies</h2>
              <DependencyTable dependencies={dependencies} />

              <h2>Repositories</h2>
              <RepositoryTable repositories={repos} />
              <ul>
                {repos.map(repo => (
                  <li key={repo.id}>
                    <p>
                      {repo.full_name}<br />
                      <em>{repo.dependencies.length} dependencies detected</em>
                    </p>
                    <div style={{ display: 'none' }}>
                      {repo.dependencies && (
                        <ul>
                          {repo.dependencies.map(dep => (
                            <li key={dep.name}>{dep.name}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          }
        </Content>
        <Footer />
      </div>
    );
  }

}
