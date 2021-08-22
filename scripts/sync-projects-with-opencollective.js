import '../env';

import fs from 'fs-extra';
import path from 'path';
import { get, uniqBy } from 'lodash';

import logger from '../src/logger';
import { fetchCollectiveWithMembers } from '../src/opencollective';

const filename = path.join(__dirname, '..', 'data', 'projects.json');

fs.readJson(filename)
  .then(async (projects) => {
    for (const project of projects) {
      if (project.opencollective) {
        const data = await fetchCollectiveWithMembers(
          project.opencollective.slug,
        );
        if (!data) {
          logger.error(`Can't fetch data for ${project.opencollective.slug}`);
          continue;
        }
        project.opencollective.name = data.name;
        project.opencollective.description = data.description;
        project.opencollective.stats = data.stats;
        project.opencollective.goals = get(data, 'settings.goals', []);
        // Github
        const githubOrg = get(data, 'settings.githubOrg');
        const githubRepo = get(data, 'settings.githubRepo');
        if (githubOrg) {
          project.github = { org: githubOrg };
        } else if (githubRepo) {
          project.github = { repo: githubRepo };
        }
        // Pledge
        if (data.isPledged) {
          data.pledge = true;
        } else {
          delete data.pledge;
        }
        // Sponsors
        let members = data.members
          .filter(
            (m) => m.role === 'BACKER' && m.member.type === 'ORGANIZATION',
          )
          .sort((a, b) => b.stats.totalDonations - a.stats.totalDonations);
        members = uniqBy(members, (member) => member.member.id);
        project.opencollective.sponsors = members.slice(0, 10).map((m) => ({
          id: m.member.id,
          type: m.member.type,
          slug: m.member.slug,
          name: m.member.name,
          totalDonations: m.stats.totalDonations,
        }));
      }
    }
    return projects;
  })
  .then((projects) => {
    fs.writeFile(filename, `${JSON.stringify(projects, null, 2)}\n`);
  });
